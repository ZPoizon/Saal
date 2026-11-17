package br.org.saal.api.photo;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;

import br.org.saal.api.auth.TestAdminProperties;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercita upload e leitura de fotografias sobre H2 (MODE=MySQL) com o schema Flyway.
 * Cada teste roda em transacao revertida.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Transactional
class StoredPhotoHttpTest {
    private static final byte[] JPEG = {
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
            (byte) 0x00, (byte) 0x10, 'J', 'F', 'I', 'F', (byte) 0x00
    };
    private static final byte[] PNG = {
            (byte) 0x89, 'P', 'N', 'G', (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A,
            (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0D
    };
    private static final byte[] WEBP = {
            'R', 'I', 'F', 'F', (byte) 0x24, (byte) 0x00, (byte) 0x00, (byte) 0x00,
            'W', 'E', 'B', 'P', 'V', 'P', '8', ' '
    };

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
    void uploadJPEGRetornaUrlPublicaEConteudoPersistido() throws Exception {
        String url = upload("foto.jpg", "image/jpeg", JPEG);

        mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(content().bytes(JPEG))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Cache-Control",
                        org.hamcrest.Matchers.containsString("immutable")));
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void uploadAceitaPNGWebPEEIgnoraParametrosDeImagemNaLeitura() throws Exception {
        upload("foto.png", "image/png", PNG);
        String webpUrl = upload("foto.webp", "image/webp", WEBP);

        mockMvc.perform(get(webpUrl).param("w", "800").param("h", "600").param("fit", "crop"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/webp"))
                .andExpect(content().bytes(WEBP));
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void uploadRejeitaFormatoNaoSuportado() throws Exception {
        MockMultipartFile text = new MockMultipartFile(
                "photos", "arquivo.txt", "text/plain",
                "nao e imagem".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/v1/admin/photos").file(text).with(csrf()))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void uploadRejeitaArquivoAcimaDoLimite() throws Exception {
        byte[] oversized = new byte[PhotoStorageService.MAX_PHOTO_BYTES + 1];
        System.arraycopy(JPEG, 0, oversized, 0, JPEG.length);
        MockMultipartFile file = new MockMultipartFile(
                "photos", "grande.jpg", "image/jpeg", oversized);

        mockMvc.perform(multipart("/api/v1/admin/photos").file(file).with(csrf()))
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    void uploadSemAutenticacaoRetorna401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "photos", "foto.jpg", "image/jpeg", JPEG);

        mockMvc.perform(multipart("/api/v1/admin/photos").file(file).with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void uploadSemCsrfRetorna403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "photos", "foto.jpg", "image/jpeg", JPEG);

        mockMvc.perform(multipart("/api/v1/admin/photos").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void fotografiaInexistenteRetorna404() throws Exception {
        mockMvc.perform(get("/api/v1/photos/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void identificadorNaoNumericoRetorna404() throws Exception {
        mockMvc.perform(get("/api/v1/photos/nao-numerico"))
                .andExpect(status().isNotFound());
    }

    private String upload(String name, String contentType, byte[] bytes) throws Exception {
        MockMultipartFile file = new MockMultipartFile("photos", name, contentType, bytes);

        MvcResult result = mockMvc.perform(
                        multipart("/api/v1/admin/photos").file(file).with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.urls.length()").value(1))
                .andReturn();

        return JsonPath.read(result.getResponse().getContentAsString(), "$.urls[0]");
    }
}
