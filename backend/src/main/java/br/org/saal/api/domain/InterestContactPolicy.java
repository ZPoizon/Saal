package br.org.saal.api.domain;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Regra tecnica de validacao do contato do interessado. Nao define finalidade, retencao
 * nem visibilidade (ONG-05): apenas rejeita valores que claramente nao sao um WhatsApp.
 */
public final class InterestContactPolicy {
    public static final int MIN_WHATSAPP_DIGITS = 10;
    public static final int MAX_WHATSAPP_DIGITS = 15;
    private static final Pattern ALLOWED_WHATSAPP_CHARACTERS =
            Pattern.compile("^\\+?[0-9\\s().-]+$");

    private InterestContactPolicy() { }

    public static boolean isValidWhatsapp(String value) {
        if (value == null) {
            return false;
        }
        String normalized = value.trim();
        if (!ALLOWED_WHATSAPP_CHARACTERS.matcher(normalized).matches()) {
            return false;
        }
        String digits = normalized.replaceAll("\\D", "");
        return digits.length() >= MIN_WHATSAPP_DIGITS && digits.length() <= MAX_WHATSAPP_DIGITS;
    }

    /** Devolve o valor sem espacos nas bordas ou lanca para conteudo invalido. */
    public static String requireValidWhatsapp(String value) {
        if (!isValidWhatsapp(value)) {
            throw new IllegalArgumentException("WhatsApp invalido.");
        }
        return Objects.requireNonNull(value).trim();
    }
}
