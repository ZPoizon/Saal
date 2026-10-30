package br.org.saal.api.system;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(SystemStatusHttpTest.InternalErrorTestConfiguration.class)
class SystemStatusHttpTest {
    @DynamicPropertySource
    static void adminCredentials(DynamicPropertyRegistry registry) {
        br.org.saal.api.auth.TestAdminProperties.register(registry);
    }

    @LocalServerPort
    private int port;

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(10))
                .GET().build();
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(req, HttpResponse.BodyHandlers.ofString());
        }
    }

    @Test
    void endpointDeStatusRespondeComJson() throws Exception {
        HttpResponse<String> response = get("/api/v1/system/status");
        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"service\":\"saal-api\""));
        assertTrue(response.body().contains("\"status\":\"RUNNING\""));
    }

    @Test
    void healthCheckComprovaServidorInicializado() throws Exception {
        HttpResponse<String> response = get("/actuator/health");
        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"status\":\"UP\""));
    }

    @Test
    void endpointDeNegocioNaoImplementadoNaoEhSimulado() throws Exception {
        HttpResponse<String> response = get("/api/v1/animals");
        assertEquals(404, response.statusCode());
        assertEquals(
                MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                response.headers().firstValue("Content-Type").orElse(null));
        assertTrue(response.body().contains("\"status\":404"), response.body());
        assertTrue(response.body().contains("\"instance\":\"/api/v1/animals\""), response.body());
        assertFalse(response.body().contains("\"animals\":"));
    }

    @Test
    void erroInternoRetornaProblemDetailSanitizado() throws Exception {
        HttpResponse<String> response = get("/__test/internal-error");
        assertEquals(500, response.statusCode());
        assertEquals(
                MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                response.headers().firstValue("Content-Type").orElse(null));
        assertTrue(response.body().contains("\"status\":500"));
        assertTrue(response.body().contains("\"title\":\"Erro interno\""));
        assertTrue(response.body().contains("Nao foi possivel concluir a operacao."));
        assertFalse(response.body().contains("sensitive-internal-marker"));
        assertFalse(response.body().contains("IllegalStateException"));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class InternalErrorTestConfiguration {
        @Bean
        InternalErrorTestController internalErrorTestController() {
            return new InternalErrorTestController();
        }
    }

    @RestController
    static class InternalErrorTestController {
        @GetMapping("/__test/internal-error")
        void fail() {
            throw new IllegalStateException("sensitive-internal-marker");
        }
    }
}
