export type Database = {
  public: {
    Tables: {
      animals: {
        Row: {
          id: string
          name: string
          species: "dog" | "cat"
          age: string
          size: "pequeno" | "médio" | "grande"
          sex: "macho" | "fêmea"
          status: "available" | "adopted"
          description: string
          personality: string[]
          medical_info: string
          images: string[]
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          species: "dog" | "cat"
          age: string
          size: "pequeno" | "médio" | "grande"
          sex: "macho" | "fêmea"
          status: "available" | "adopted"
          description: string
          personality: string[]
          medical_info: string
          images: string[]
          created_by?: string
        }
        Update: {
          id?: string
          name?: string
          species?: "dog" | "cat"
          age?: string
          size?: "pequeno" | "médio" | "grande"
          sex?: "macho" | "fêmea"
          status?: "available" | "adopted"
          description?: string
          personality?: string[]
          medical_info?: string
          images?: string[]
          updated_by?: string
        }
      }
      animal_photos: {
        Row: {
          id: string
          animal_id: string
          url: string
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          animal_id: string
          url: string
          storage_path: string
        }
        Update: {
          id?: string
          animal_id?: string
          url?: string
          storage_path?: string
        }
      }
      interests: {
        Row: {
          id: string
          animal_id: string
          animal_name: string
          full_name: string
          whatsapp: string
          city: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          animal_id: string
          animal_name: string
          full_name: string
          whatsapp: string
          city: string
          email: string
        }
        Update: {
          id?: string
          animal_id?: string
          animal_name?: string
          full_name?: string
          whatsapp?: string
          city?: string
          email?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_by?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_by?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: "admin"
          display_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: "admin"
          display_name: string
        }
        Update: {
          id?: string
          email?: string
          role?: "admin"
          display_name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

export type DatabasePublic = Database["public"]
