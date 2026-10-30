package br.org.saal.api.auth;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.context.annotation.Import;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "saal.security.cors.allowed-origins=https://admin.example.test",
                "server.servlet.session.cookie.secure=false"
        })
@Import(AdminAuthorizationHttpTest.ProbeConfiguration.class)
class AdminAuthenticationHttpTest {
    private static final Pattern CSRF_TOKEN = Pattern.compile("\"token\":\"([^\"]+)\"");
    private static final Pattern CSRF_HEADER = Pattern.compile("\"headerName\":\"([^\"]+)\"");

    @LocalServerPort
    private int port;

    @Autowired
    private LoginAttemptLimiter loginAttemptLimiter;

    private CookieManager cookies;
    private HttpClient client;

    @DynamicPropertySource
    static void adminCredentials(DynamicPropertyRegistry registry) {
        TestAdminProperties.register(registry);
    }

    @BeforeEach
    void setUp() {
        loginAttemptLimiter.clearAll();
        cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        client = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void loginValidoCriaSessaoELogoutInvalidaSessaoNoServidor() throws Exception {
        HttpResponse<String> login = postLogin(TestAdminProperties.USERNAME, TestAdminProperties.PASSWORD);

        assertEquals(204, login.statusCode());
        String sessionCookie = login.headers().firstValue("Set-Cookie").orElseThrow();
        assertTrue(sessionCookie.contains("HttpOnly"));
        assertTrue(sessionCookie.contains("SameSite=Lax"));

        HttpResponse<String> session = get("/api/v1/auth/session");
        assertTrue(session.body().contains("\"authenticated\":true"));
        assertEquals("nosniff", session.headers().firstValue("X-Content-Type-Options").orElseThrow());
        assertEquals("DENY", session.headers().firstValue("X-Frame-Options").orElseThrow());
        assertTrue(session.headers().firstValue("Content-Security-Policy").orElseThrow()
                .contains("default-src 'none'"));
        assertEquals("no-referrer", session.headers().firstValue("Referrer-Policy").orElseThrow());
        assertTrue(session.headers().firstValue("Cache-Control").orElseThrow().contains("no-store"));
        assertEquals("900", get("/api/v1/admin/probe/session-timeout").body());
        assertEquals(200, get("/api/v1/admin/probe").statusCode());

        String csrfToken = csrfToken();
        HttpResponse<String> logout = post("/api/v1/auth/logout", csrfToken, "");
        assertEquals(204, logout.statusCode());
        assertTrue(get("/api/v1/auth/session").body().contains("\"authenticated\":false"));
        assertEquals(401, get("/api/v1/admin/probe").statusCode());
    }

    @Test
    void credenciaisInvalidasTemRespostaGenericaSemEnumeracao() throws Exception {
        HttpResponse<String> unknownUser =
                postLogin("usuario-inexistente", "senha-incorreta-sintetica");
        HttpResponse<String> wrongPassword =
                postLogin(TestAdminProperties.USERNAME, "senha-incorreta-sintetica");

        assertEquals(401, unknownUser.statusCode());
        assertEquals(401, wrongPassword.statusCode());
        assertEquals(unknownUser.body(), wrongPassword.body());
        assertFalse(unknownUser.body().contains("usuario-inexistente"));
        assertFalse(unknownUser.body().contains("senha-incorreta-sintetica"));
    }

    @Test
    void loginSemCsrfEhRejeitado() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/v1/auth/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "username=" + encode(TestAdminProperties.USERNAME)
                                + "&password=" + encode(TestAdminProperties.PASSWORD)))
                .build();

        assertEquals(403, client.send(request, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    void limiteDeTentativasRetorna429AposDezFalhas() throws Exception {
        String csrfToken = csrfToken();
        for (int attempt = 0; attempt < LoginAttemptLimiter.MAX_FAILURES; attempt++) {
            assertEquals(401, post(
                    "/api/v1/auth/login",
                    csrfToken,
                    "username=wrong&password=wrong").statusCode());
        }

        HttpResponse<String> limited = post(
                "/api/v1/auth/login",
                csrfToken,
                "username=wrong&password=wrong");
        assertEquals(429, limited.statusCode());
        assertEquals("900", limited.headers().firstValue("Retry-After").orElseThrow());
    }

    @Test
    void corsAceitaSomenteOrigemConfigurada() throws Exception {
        HttpResponse<String> allowed = preflight("https://admin.example.test");
        assertEquals(200, allowed.statusCode());
        assertEquals(
                "https://admin.example.test",
                allowed.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
        assertEquals("true", allowed.headers().firstValue("Access-Control-Allow-Credentials").orElseThrow());

        HttpResponse<String> denied = preflight("https://attacker.example.test");
        assertEquals(403, denied.statusCode());
        assertFalse(denied.headers().firstValue("Access-Control-Allow-Origin").isPresent());
    }

    private HttpResponse<String> preflight(String origin) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/v1/auth/login"))
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type,x-csrf-token")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String csrfToken() throws Exception {
        HttpResponse<String> response = get("/api/v1/auth/csrf");
        assertEquals(200, response.statusCode());
        Matcher token = CSRF_TOKEN.matcher(response.body());
        Matcher header = CSRF_HEADER.matcher(response.body());
        assertTrue(token.find());
        assertTrue(header.find());
        assertEquals("X-CSRF-TOKEN", header.group(1));
        return token.group(1);
    }

    private HttpResponse<String> postLogin(String username, String password) throws Exception {
        return post(
                "/api/v1/auth/login",
                csrfToken(),
                "username=" + encode(username) + "&password=" + encode(password));
    }

    private HttpResponse<String> post(String path, String csrfToken, String form) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("X-CSRF-TOKEN", csrfToken)
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .timeout(Duration.ofSeconds(5))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
