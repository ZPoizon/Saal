package br.org.saal.api.interest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;

import br.org.saal.api.auth.TestAdminProperties;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercita o envio publico de interesse e as consultas administrativas sobre H2 (MODE=MySQL).
 * Cada teste usa um endereco remoto distinto para nao compartilhar o limitador antiabuso,
 * que vive em memoria e nao participa da transacao revertida.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Transactional
class AnimalInterestApiHttpTest {
    @Autowired
    private WebApplicationContext applicationContext;

    private MockMvc mockMvc;

    @DynamicPropertySource
    static void adminCredentials(DynamicPropertyRegistry registry) {
        TestAdminProperties.register(registry);
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void registraInteresseEmAnimalDisponivelSemExporPii() throws Exception {
        String id = createAnimal("Rex", "AVAILABLE");

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.received").value(true))
                .andExpect(jsonPath("$.fullName").doesNotExist())
                .andExpect(jsonPath("$.whatsapp").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.city").doesNotExist());

        mockMvc.perform(get("/api/v1/admin/interests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("Maria Silva"))
                .andExpect(jsonPath("$[0].animalId").value(id))
                .andExpect(jsonPath("$[0].animalName").value("Rex"));
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void naoRegistraInteresseEmAnimalAdotado() throws Exception {
        String id = createAnimal("Adotado", "ADOPTED");

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.2"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/admin/interests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void naoRegistraInteresseEmAnimalInexistente() throws Exception {
        mockMvc.perform(post("/api/v1/animals/999999/interests")
                        .with(remoteAddress("198.51.100.3"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void rejeitaPayloadInvalido() throws Exception {
        String id = createAnimal("Rex", "AVAILABLE");

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.4"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"\",\"whatsapp\":\"\",\"city\":\"\",\"email\":\"\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.11"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace(
                                "(11) 99999-9999", "abc (11) 99999-9999")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.5"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace("(11) 99999-9999", "123")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.6"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace("maria@example.com", "nao-e-email")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.14"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace("Maria Silva", "M".repeat(121))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.15"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace(
                                "maria@example.com", "m".repeat(150) + "@example.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validaTamanhoMinimoDepoisDeRemoverEspacosDasBordas() throws Exception {
        String id = createAnimal("Rex", "AVAILABLE");

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.12"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace("Maria Silva", "  x  ")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.13"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson().replace("São Paulo", " x ")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void consultaAdministrativaDeInteressesExigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/v1/admin/interests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void envioPublicoNaoExigeAutenticacao() throws Exception {
        String id = createAnimal("Rex", "AVAILABLE");

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress("198.51.100.10"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.received").value(true))
                .andExpect(jsonPath("$.fullName").doesNotExist());
    }

    @Test
    void consultaDeAnimalExigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/v1/admin/animals/1/interests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "synthetic-user", roles = "USER")
    void identidadeSemPapelAdministrativoRecebe403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/interests"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/animals/1/interests"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void consultaInteressesDeUmAnimalEspecifico() throws Exception {
        String rex = createAnimal("Rex", "AVAILABLE");
        String luna = createAnimal("Luna", "AVAILABLE");

        submit(rex, "198.51.100.7");
        submit(luna, "198.51.100.8");

        mockMvc.perform(get("/api/v1/admin/animals/" + rex + "/interests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].animalName").value("Rex"));

        mockMvc.perform(get("/api/v1/admin/animals/999999/interests"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void bloqueiaEnviosAbusivosPorCliente() throws Exception {
        String id = createAnimal("Rex", "AVAILABLE");
        String client = "198.51.100.9";

        for (int submission = 0; submission < InterestSubmissionLimiter.MAX_SUBMISSIONS; submission++) {
            submit(id, client);
        }

        mockMvc.perform(post("/api/v1/animals/" + id + "/interests")
                        .with(remoteAddress(client))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.fullName").doesNotExist())
                .andExpect(jsonPath("$.email").doesNotExist());
    }

    private void submit(String animalId, String clientAddress) throws Exception {
        mockMvc.perform(post("/api/v1/animals/" + animalId + "/interests")
                        .with(remoteAddress(clientAddress))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(interestJson()))
                .andExpect(status().isCreated());
    }

    private String createAnimal(String name, String status) throws Exception {
        String body = """
                {
                  "name": "%s",
                  "species": "dog",
                  "age": "3 anos",
                  "size": "médio",
                  "sex": "macho",
                  "status": "%s",
                  "description": "Descricao sintetica para teste.",
                  "personality": ["Docil"],
                  "medicalInfo": "Vacinado.",
                  "photos": ["https://example.test/photo.jpg"]
                }
                """.formatted(name, status);
        String created = mockMvc.perform(post("/api/v1/admin/animals")
                        .with(user("synthetic-admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(created, "$.id");
    }

    private static String interestJson() {
        return """
                {
                  "fullName": "Maria Silva",
                  "whatsapp": "(11) 99999-9999",
                  "city": "São Paulo",
                  "email": "maria@example.com"
                }
                """;
    }

    private static RequestPostProcessor remoteAddress(String address) {
        return request -> {
            request.setRemoteAddr(address);
            return request;
        };
    }
}
