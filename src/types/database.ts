export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string // UUID
          invoice_number: string
          date: string
          client_name: string
          client_contact: string
          client_address: string
          total: number // DECIMAL(12,2)
          advance: number // DECIMAL(12,2)
          remaining_balance: number // DECIMAL(12,2)
          payment_terms: string
          terms_and_conditions: string
          bank_account_details: string
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // UUID
          invoice_number: string
          date: string
          client_name: string
          client_contact: string
          client_address: string
          total: number
          advance: number
          remaining_balance: number
          payment_terms: string
          terms_and_conditions: string
          bank_account_details: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          invoice_number?: string
          date?: string
          client_name?: string
          client_contact?: string
          client_address?: string
          total?: number
          advance?: number
          remaining_balance?: number
          payment_terms?: string
          terms_and_conditions?: string
          bank_account_details?: string
          updated_at?: string
        }
      }
      recurring_schedules: {
        Row: {
          id: string // UUID
          invoice_id: string
          start_date: string
          end_date: string | null
          interval: string
          day_of_month: number | null
          next_generation_date: string
          status: string
          last_generated_date: string | null
          generated_count: number
          max_occurrences: number | null
          template_number: string
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string
          invoice_id: string
          start_date: string
          end_date?: string | null
          interval: string
          day_of_month?: number | null
          next_generation_date: string
          status?: string
          last_generated_date?: string | null
          generated_count?: number
          max_occurrences?: number | null
          template_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          invoice_id?: string
          start_date?: string
          end_date?: string | null
          interval?: string
          day_of_month?: number | null
          next_generation_date?: string
          status?: string
          last_generated_date?: string | null
          generated_count?: number
          max_occurrences?: number | null
          template_number?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string // UUID
          invoice_id: string // UUID foreign key
          description: string
          quantity: number // INTEGER
          rate: number // DECIMAL(12,2)
          amount: number // DECIMAL(12,2)
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // UUID
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['invoice_items']['Insert'], 'id'>>
      }
      quotations: {
        Row: {
          id: string // UUID
          quotation_number: string
          date: string
          expiry_date: string
          status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'
          client_name: string
          client_contact: string
          client_address: string
          total: number // DECIMAL(12,2)
          quotation_terms: string
          terms_and_conditions: string
          bank_account_details: string
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // UUID
          quotation_number: string
          date: string
          expiry_date: string
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'
          client_name: string
          client_contact: string
          client_address: string
          total: number
          quotation_terms: string
          terms_and_conditions: string
          bank_account_details: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          quotation_number?: string
          date?: string
          expiry_date?: string
          status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'
          client_name?: string
          client_contact?: string
          client_address?: string
          total?: number
          quotation_terms?: string
          terms_and_conditions?: string
          bank_account_details?: string
          updated_at?: string
        }
      }
      quotation_items: {
        Row: {
          id: string // UUID
          quotation_id: string // UUID foreign key
          description: string
          quantity: number // INTEGER
          rate: number // DECIMAL(12,2)
          amount: number // DECIMAL(12,2)
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // UUID
          quotation_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['quotation_items']['Insert'], 'id'>>
      }
      company_info: {
        Row: {
          id: string // UUID
          name: string
          address: string
          phone: string | null
          email: string | null
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // UUID
          name: string
          address: string
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['company_info']['Insert'], 'id'>>
      }
    }
  }
}