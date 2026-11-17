package br.org.saal.api.animal;

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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;

import br.org.saal.api.auth.TestAdminProperties;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercita os endpoints de animais sobre H2 (MODE=MySQL) com o schema criado pelo Flyway.
 * Cada teste roda em transacao revertida, sem persistir dados residuais.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Transactional
class AnimalApiHttpTest {
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
    void cadastraConsultaEAtualizaAnimal() throws Exception {
        String created = createAnimal("Rex", "dog", "AVAILABLE", 2);
        String id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/v1/admin/animals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].photos.length()").value(2));

        mockMvc.perform(get("/api/v1/admin/animals/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rex"));

        mockMvc.perform(put("/api/v1/admin/animals/" + id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("Rex Atualizado", "dog", "ADOPTED", 1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rex Atualizado"))
                .andExpect(jsonPath("$.status").value("ADOPTED"))
                .andExpect(jsonPath("$.photos.length()").value(1));
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void exclusaoDefinitivaEstaDesabilitada() throws Exception {
        String created = createAnimal("Rex", "dog", "AVAILABLE", 1);
        String id = JsonPath.read(created, "$.id");

        mockMvc.perform(delete("/api/v1/admin/animals/" + id).with(csrf()))
                .andExpect(status().isMethodNotAllowed());

        mockMvc.perform(get("/api/v1/admin/animals/" + id))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void catalogoPublicoListaSomenteAnimaisDisponiveis() throws Exception {
        createAnimal("Disponivel", "dog", "AVAILABLE", 1);
        createAnimal("Adotado", "cat", "ADOPTED", 1);

        mockMvc.perform(get("/api/v1/animals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Disponivel"))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[0].medicalInfo").doesNotExist());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void catalogoPublicoFiltraPorEspecieENome() throws Exception {
        createAnimal("Rex", "dog", "AVAILABLE", 1);
        createAnimal("Luna", "cat", "AVAILABLE", 1);

        mockMvc.perform(get("/api/v1/animals").param("species", "cat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Luna"));

        mockMvc.perform(get("/api/v1/animals").param("search", "rex"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Rex"));
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void detalhePublicoRetornaAnimalAdotadoPorId() throws Exception {
        String created = createAnimal("Adotado", "dog", "ADOPTED", 1);
        String id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/v1/animals/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ADOPTED"))
                .andExpect(jsonPath("$.medicalInfo").doesNotExist());
    }

    @Test
    void catalogoPublicoNaoExigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/v1/animals")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void rejeitaQuantidadeDeFotosForaDoLimite() throws Exception {
        mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("SemFoto", "dog", "AVAILABLE", 0)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("QuatroFotos", "dog", "AVAILABLE", 4)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void rejeitaCamposObrigatoriosEValoresInvalidos() throws Exception {
        mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("", "dog", "AVAILABLE", 1)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("Ave", "bird", "AVAILABLE", 1)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("Pendente", "dog", "PENDING", 1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void mutacaoSemCsrfEhRejeitada() throws Exception {
        mockMvc.perform(post("/api/v1/admin/animals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson("SemCsrf", "dog", "AVAILABLE", 1)))
                .andExpect(status().isForbidden());
    }

    @Test
    void visitanteRecebe401NaApiAdministrativaDeAnimais() throws Exception {
        mockMvc.perform(get("/api/v1/admin/animals"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "synthetic-user", roles = "USER")
    void identidadeSemPapelAdministrativoRecebe403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/animals"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void identificadorInexistenteOuInvalidoRetorna404() throws Exception {
        mockMvc.perform(get("/api/v1/admin/animals/999999"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/animals/nao-numerico"))
                .andExpect(status().isNotFound());
    }

    private String createAnimal(String name, String species, String status, int photoCount)
            throws Exception {
        return mockMvc.perform(post("/api/v1/admin/animals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(animalJson(name, species, status, photoCount)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
    }

    private static String animalJson(String name, String species, String status, int photoCount) {
        StringBuilder photos = new StringBuilder();
        for (int index = 0; index < photoCount; index++) {
            if (index > 0) {
                photos.append(',');
            }
            photos.append("\"https://example.test/photo-").append(index).append(".jpg\"");
        }
        return """
                {
                  "name": "%s",
                  "species": "%s",
                  "age": "3 anos",
                  "size": "médio",
                  "sex": "macho",
                  "status": "%s",
                  "description": "Descricao sintetica para teste.",
                  "personality": ["Docil", "Calmo"],
                  "medicalInfo": "Vacinado e castrado.",
                  "photos": [%s]
                }
                """.formatted(name, species, status, photos);
    }
}
