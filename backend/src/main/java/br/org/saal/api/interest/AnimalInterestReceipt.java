package br.org.saal.api.interest;

/**
 * Confirmacao publica de registro. Deliberadamente minima: nao devolve identificador,
 * nome, WhatsApp, cidade, e-mail nem referencia enumeravel, para nao expor dados pessoais.
 */
public record AnimalInterestReceipt(boolean received, String createdAt) {
}
