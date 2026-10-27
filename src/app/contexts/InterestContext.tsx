import { createContext, useContext, useState, ReactNode } from "react";

export interface InterestRequest {
  id: string;
  animalId: string;
  animalName: string;
  animalImage: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

interface InterestContextType {
  interests: InterestRequest[];
  addInterest: (interest: Omit<InterestRequest, "id" | "status" | "date">) => void;
  updateInterestStatus: (id: string, status: "accepted" | "rejected") => void;
}

const InterestContext = createContext<InterestContextType | undefined>(undefined);

export function InterestProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<InterestRequest[]>([]);

  const addInterest = (interest: Omit<InterestRequest, "id" | "status" | "date">) => {
    const newInterest: InterestRequest = {
      ...interest,
      id: String(Date.now()),
      status: "pending",
      date: new Date().toISOString(),
    };
    setInterests((prev) => [newInterest, ...prev]);
  };

  const updateInterestStatus = (id: string, status: "accepted" | "rejected") => {
    setInterests((prev) =>
      prev.map((interest) =>
        interest.id === id ? { ...interest, status } : interest
      )
    );
  };

  return (
    <InterestContext.Provider value={{ interests, addInterest, updateInterestStatus }}>
      {children}
    </InterestContext.Provider>
  );
}

export function useInterest() {
  const context = useContext(InterestContext);
  if (!context) {
    throw new Error("useInterest must be used within an InterestProvider");
  }
  return context;
}
