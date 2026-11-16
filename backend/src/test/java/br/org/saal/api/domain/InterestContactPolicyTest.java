package br.org.saal.api.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InterestContactPolicyTest {
    @Test
    void aceitaNumerosBrasileirosComOuSemFormatacao() {
        assertTrue(InterestContactPolicy.isValidWhatsapp("(11) 99999-9999"));
        assertTrue(InterestContactPolicy.isValidWhatsapp("11999999999"));
        assertTrue(InterestContactPolicy.isValidWhatsapp("+55 11 99999-9999"));
    }

    @Test
    void rejeitaNumerosCurtosLongosOuVazios() {
        assertFalse(InterestContactPolicy.isValidWhatsapp("123"));
        assertFalse(InterestContactPolicy.isValidWhatsapp("abc (11) 99999-9999"));
        assertFalse(InterestContactPolicy.isValidWhatsapp("++55 11 99999-9999"));
        assertFalse(InterestContactPolicy.isValidWhatsapp("12345678901234567890"));
        assertFalse(InterestContactPolicy.isValidWhatsapp(""));
        assertFalse(InterestContactPolicy.isValidWhatsapp(null));
    }

    @Test
    void normalizaAparandoEspacosOuLancaParaValorInvalido() {
        assertEquals("(11) 99999-9999", InterestContactPolicy.requireValidWhatsapp("  (11) 99999-9999  "));
        assertThrows(IllegalArgumentException.class,
                () -> InterestContactPolicy.requireValidWhatsapp("abc"));
    }
}
