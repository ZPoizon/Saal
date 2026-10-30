package br.org.saal.api.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Import(AdminAuthorizationHttpTest.ProbeConfiguration.class)
class AdminAuthorizationHttpTest {
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext applicationContext;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @DynamicPropertySource
    static void adminCredentials(DynamicPropertyRegistry registry) {
        TestAdminProperties.register(registry);
    }

    @Test
    void visitanteRecebe401NaApiAdministrativa() throws Exception {
        mockMvc.perform(get("/api/v1/admin/probe"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "synthetic-admin", roles = "ADMIN")
    void administradorProvisionadoPodeAcessarApiAdministrativa() throws Exception {
        mockMvc.perform(get("/api/v1/admin/probe"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "synthetic-user", roles = "USER")
    void identidadeSemAutoridadeAdministrativaRecebe403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/probe"))
                .andExpect(status().isForbidden());
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class ProbeConfiguration {
        @Bean
        ProbeController probeController() {
            return new ProbeController();
        }
    }

    @RestController
    static class ProbeController {
        @GetMapping("/api/v1/admin/probe")
        String probe() {
            return "test-only";
        }

        @GetMapping("/api/v1/admin/probe/session-timeout")
        int sessionTimeout(HttpServletRequest request) {
            return request.getSession(false).getMaxInactiveInterval();
        }
    }
}
