export type AnimalStatus = "available" | "adopted"

export type AnimalSpecies = "dog" | "cat"

export type AnimalSize = "pequeno" | "médio" | "grande"

export type AnimalSex = "macho" | "fêmea"

export interface Animal {
  id: string

  name: string

  species: AnimalSpecies

  age: string

  size: AnimalSize

  sex: AnimalSex

  status: AnimalStatus

  description: string

  personality: string[]

  medicalInfo: string

  images: string[]
}

/**
 * Dados aceitos para cadastro/edição. As fotos continuam sendo referências (URLs),
 * sem upload de arquivos: a API persiste os endereços informados.
 */
export interface AnimalInput {
  name: string

  species: AnimalSpecies

  age: string

  size: AnimalSize

  sex: AnimalSex

  status: AnimalStatus

  description: string

  personality: string[]

  medicalInfo: string

  images: string[]
}
