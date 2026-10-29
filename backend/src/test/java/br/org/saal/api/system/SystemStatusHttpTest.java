package br.org.saal.api.system;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SystemStatusHttpTest {
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
    }
}
