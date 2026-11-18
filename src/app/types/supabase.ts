export interface AdoptionRow {
  id: string

  animal_id: string | null

  animal_name: string

  animal_species: "dog" | "cat" | null

  animal_sex: "macho" | "fêmea" | null

  animal_size: "pequeno" | "médio" | "grande" | null

  animal_age: string | null

  animal_description: string | null

  animal_medical_info: string | null

  animal_personality: string[] | null

  interest_id: string | null

  origin: "site" | "external"

  adopter_name: string

  adopter_phone: string | null

  adopter_email: string | null

  adoption_date: string

  notes: string | null

  confirmed_by: string | null

  confirmed_at: string

  reversed_at: string | null

  reversed_by: string | null

  reversal_reason: string | null

  cleanup_status: "pending" | "scheduled" | "completed" | "failed" | "cancelled"

  cleanup_error: string | null

  cleanup_attempted_at: string | null

  cleanup_completed_at: string | null

  created_at: string
}

export interface AdoptionCleanupCandidateRow {
  adoption_id: string

  animal_id: string

  animal_name: string

  adopted_at: string

  deadline_at: string

  image_urls: string[]

  cleanup_status: AdoptionRow["cleanup_status"]
}

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

          status: "available" | "treatment" | "adopted"

          description: string

          personality: string[]

          medical_info: string

          images: string[]

          adopted_at: string | null

          archived_at: string | null

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

          status: "available" | "treatment" | "adopted"

          description: string

          personality: string[]

          medical_info: string

          images: string[]

          adopted_at?: string | null

          archived_at?: string | null

          created_by?: string
        }

        Update: {
          id?: string

          name?: string

          species?: "dog" | "cat"

          age?: string

          size?: "pequeno" | "médio" | "grande"

          sex?: "macho" | "fêmea"

          status?: "available" | "treatment" | "adopted"

          description?: string

          personality?: string[]

          medical_info?: string

          images?: string[]

          adopted_at?: string | null

          archived_at?: string | null
        }
      }

      adoptions: {
        Row: AdoptionRow

        Insert: {
          id?: string

          animal_id?: string | null

          animal_name: string

          animal_species?: "dog" | "cat" | null

          animal_sex?: "macho" | "fêmea" | null

          animal_size?: "pequeno" | "médio" | "grande" | null

          animal_age?: string | null

          animal_description?: string | null

          animal_medical_info?: string | null

          animal_personality?: string[] | null

          interest_id?: string | null

          origin: "site" | "external"

          adopter_name: string

          adopter_phone?: string | null

          adopter_email?: string | null

          adoption_date: string

          notes?: string | null

          confirmed_by?: string | null

          reversed_at?: string | null

          reversed_by?: string | null

          reversal_reason?: string | null

          cleanup_status?: "pending" | "scheduled" | "completed" | "failed" | "cancelled"

          cleanup_error?: string | null

          cleanup_attempted_at?: string | null

          cleanup_completed_at?: string | null
        }

        Update: {
          id?: string

          animal_id?: string | null

          animal_name?: string

          animal_species?: "dog" | "cat" | null

          animal_sex?: "macho" | "fêmea" | null

          animal_size?: "pequeno" | "médio" | "grande" | null

          animal_age?: string | null

          animal_description?: string | null

          animal_medical_info?: string | null

          animal_personality?: string[] | null

          interest_id?: string | null

          origin?: "site" | "external"

          adopter_name?: string

          adopter_phone?: string | null

          adopter_email?: string | null

          adoption_date?: string

          notes?: string | null

          confirmed_by?: string | null

          reversed_at?: string | null

          reversed_by?: string | null

          reversal_reason?: string | null

          cleanup_status?: "pending" | "scheduled" | "completed" | "failed" | "cancelled"

          cleanup_error?: string | null

          cleanup_attempted_at?: string | null

          cleanup_completed_at?: string | null
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

    Views: { [_ in never]: never }

    Functions: {
      confirm_adoption: {
        Args: {
          p_animal_id: string

          p_interest_id: string | null

          p_origin: "site" | "external"

          p_adopter_name: string

          p_adopter_phone: string | null

          p_adopter_email: string | null

          p_adoption_date: string

          p_notes: string | null
        }

        Returns: AdoptionRow
      }

      reverse_adoption: {
        Args: {
          p_adoption_id: string

          p_reason: string

          p_target_status: "available" | "treatment"
        }

        Returns: AdoptionRow
      }

      regularize_legacy_adoption: {
        Args: {
          p_animal_id: string

          p_adoption_date: string

          p_adopter_name: string

          p_notes: string | null
        }

        Returns: AdoptionRow
      }

      list_adoption_cleanup_candidates: {
        Args: { p_now?: string }

        Returns: AdoptionCleanupCandidateRow[]
      }

      record_adoption_cleanup: {
        Args: {
          p_adoption_id: string

          p_status: AdoptionRow["cleanup_status"]

          p_removed_urls: string[]

          p_error: string | null
        }

        Returns: AdoptionRow
      }

      is_admin: {
        Args: Record<PropertyKey, never>

        Returns: boolean
      }
    }

    Enums: { [_ in never]: never }

    CompositeTypes: { [_ in never]: never }
  }
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

export type DatabasePublic = Database["public"]
