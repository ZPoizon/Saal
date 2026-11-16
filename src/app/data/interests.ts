/** Dados aceitos no envio publico de manifestacao de interesse. */
export interface AnimalInterestInput {
  fullName: string
  whatsapp: string
  city: string
  email: string
}

/** Confirmacao publica minima devolvida pela API; nunca contem dados pessoais. */
export interface AnimalInterestReceipt {
  received: boolean
  createdAt: string | null
}

/** Projecao administrativa de uma manifestacao de interesse (contem PII). */
export interface AdminAnimalInterest {
  id: string
  animalId: string
  animalName: string
  fullName: string
  whatsapp: string
  city: string
  email: string
  createdAt: string
}
