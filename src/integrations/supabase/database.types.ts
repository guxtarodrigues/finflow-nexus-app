
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
      categories: {
        Row: {
          id: string
          name: string
          type: "income" | "expense" | "investment"
          color: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          type: "income" | "expense" | "investment"
          color?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          type?: "income" | "expense" | "investment"
          color?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      investments: {
        Row: {
          id: string
          name: string
          amount: number
          return_rate: number
          start_date: string
          end_date: string | null
          status: "active" | "completed" | "cancelled"
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          return_rate: number
          start_date: string
          end_date?: string | null
          status: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          return_rate?: number
          start_date?: string
          end_date?: string | null
          status?: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      payments: {
        Row: {
          id: string
          description: string
          recipient: string
          value: number
          due_date: string
          payment_method: string
          recurrence: string
          status: string
          category_id: string | null
          client_id: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          description: string
          recipient: string
          value: number
          due_date: string
          payment_method: string
          recurrence: string
          status: string
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          description?: string
          recipient?: string
          value?: number
          due_date?: string
          payment_method?: string
          recurrence?: string
          status?: string
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          description: string
          value: number
          type: "income" | "expense"
          date: string
          category: string
          category_id: string | null
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          description: string
          value: number
          type: "income" | "expense"
          date?: string
          category: string
          category_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          description?: string
          value?: number
          type?: "income" | "expense"
          date?: string
          category?: string
          category_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
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
