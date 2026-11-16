import { createContext, useContext, useState, type ReactNode } from "react"

import { Animal, mockAnimals } from "../data/animals"

import {
  loadAnimals,
  saveAnimals as persistAnimals,
} from "../data/animalStorage"

const LOAD_ERROR =
  "Não foi possível ler os animais salvos neste navegador. Os dados de demonstração estão sendo exibidos."

const SAVE_ERROR =
  "Não foi possível salvar neste navegador. Verifique o espaço disponível e as permissões do navegador."

interface AnimalContextValue {
  animals: Animal[]

  storageError: string | null

  saveAnimals: (animals: Animal[]) => boolean
}

const AnimalContext = createContext<AnimalContextValue | undefined>(undefined)

function getInitialState(): Pick<AnimalContextValue, "animals" | "storageError"> {
  try {
    return {
      animals: loadAnimals(window.localStorage),

      storageError: null,
    }
  } catch {
    return {
      animals: mockAnimals,

      storageError: LOAD_ERROR,
    }
  }
}

export function AnimalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(getInitialState)

  const saveAnimals = (animals: Animal[]): boolean => {
    try {
      persistAnimals(window.localStorage, animals)

      setState({ animals, storageError: null })

      return true
    } catch {
      setState((current) => ({ ...current, storageError: SAVE_ERROR }))

      return false
    }
  }

  return (
    <AnimalContext.Provider value={{ ...state, saveAnimals }}>
      {children}
    </AnimalContext.Provider>
  )
}

export function useAnimals() {
  const context = useContext(AnimalContext)

  if (!context) {
    throw new Error("useAnimals must be used within an AnimalProvider")
  }

  return context
}
