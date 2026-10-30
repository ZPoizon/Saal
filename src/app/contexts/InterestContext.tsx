import { createContext, useContext, type ReactNode } from "react"

export interface InterestRequest {
  id: string

  animalId: string

  animalName: string

  animalImage: string

  name: string

  whatsapp: string

  city: string

  email: string

  date: string
}

interface InterestContextType {
  interests: readonly InterestRequest[]
}

const InterestContext = createContext<InterestContextType | undefined>(
  undefined,
)

const EMPTY_INTERESTS: readonly InterestRequest[] = []

export function InterestProvider({ children }: { children: ReactNode }) {
  return (
    <InterestContext.Provider value={{ interests: EMPTY_INTERESTS }}>
      {children}
    </InterestContext.Provider>
  )
}

export function useInterest() {
  const context = useContext(InterestContext)

  if (!context) {
    throw new Error("useInterest must be used within an InterestProvider")
  }

  return context
}
