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
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>
      }
      company_info: {
        Row: {
          id: string
          name: string
          address: string
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['company_info']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['company_info']['Insert']>
      }
    }
  }
}