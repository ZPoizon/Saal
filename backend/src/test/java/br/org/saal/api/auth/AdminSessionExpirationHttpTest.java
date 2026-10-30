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

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "server.servlet.session.timeout=1m",
                "server.servlet.session.cookie.secure=false"
        })
@Import(AdminAuthorizationHttpTest.ProbeConfiguration.class)
class AdminSessionExpirationHttpTest {
    private static final Pattern CSRF_TOKEN = Pattern.compile("\"token\":\"([^\"]+)\"");

    @LocalServerPort
    private int port;

    @DynamicPropertySource
    static void adminCredentials(DynamicPropertyRegistry registry) {
        TestAdminProperties.register(registry);
    }

    @Test
    void sessaoOciosaExpiraEApiAdminVoltaANegarAcesso() throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        String csrfToken = csrfToken(client);
        HttpRequest login = HttpRequest.newBuilder(uri("/api/v1/auth/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("X-CSRF-TOKEN", csrfToken)
                .POST(HttpRequest.BodyPublishers.ofString(
                        "username=" + encode(TestAdminProperties.USERNAME)
                                + "&password=" + encode(TestAdminProperties.PASSWORD)))
                .build();
        assertEquals(204, client.send(login, HttpResponse.BodyHandlers.ofString()).statusCode());
        assertTrue(get(client, "/api/v1/auth/session").body().contains("\"authenticated\":true"));
        assertEquals(60, Integer.parseInt(get(client, "/api/v1/admin/probe/session-timeout").body()));

        Thread.sleep(61_000);

        HttpResponse<String> expiredSession = get(client, "/api/v1/auth/session");
        assertTrue(
                expiredSession.body().contains("\"authenticated\":false"),
                () -> "Unexpected session state after idle timeout: " + expiredSession.body());
        assertEquals(401, get(client, "/api/v1/admin/probe").statusCode());
    }

    private String csrfToken(HttpClient client) throws Exception {
        HttpResponse<String> response = get(client, "/api/v1/auth/csrf");
        Matcher matcher = CSRF_TOKEN.matcher(response.body());
        assertTrue(matcher.find());
        return matcher.group(1);
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
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
