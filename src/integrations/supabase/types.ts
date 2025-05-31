export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          active: boolean
          created_at: string
          description: string
          due_date: string | null
          id: string
          is_default: boolean | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          is_default?: boolean | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_default?: boolean | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          dre_classification: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          dre_classification?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          dre_classification?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contract_end: string | null
          contract_start: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          last_payment_date: string | null
          monthly_value: number | null
          name: string
          payment_due_day: number | null
          payment_status: string | null
          phone: string | null
          product_id: string | null
          recurring_payment: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_value?: number | null
          name: string
          payment_due_day?: number | null
          payment_status?: string | null
          phone?: string | null
          product_id?: string | null
          recurring_payment?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          last_payment_date?: string | null
          monthly_value?: number | null
          name?: string
          payment_due_day?: number | null
          payment_status?: string | null
          phone?: string | null
          product_id?: string | null
          recurring_payment?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dre_snapshots: {
        Row: {
          client_id: string | null
          created_at: string
          custo_produtos_servicos: number
          data_snapshot: Json
          deducoes: number
          despesas_operacionais: number
          id: string
          impostos: number
          lucro_antes_impostos: number
          lucro_bruto: number
          lucro_liquido: number
          period_end: string
          period_start: string
          receita_bruta: number
          receita_liquida: number
          resultado_financeiro: number
          resultado_operacional: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          custo_produtos_servicos?: number
          data_snapshot?: Json
          deducoes?: number
          despesas_operacionais?: number
          id?: string
          impostos?: number
          lucro_antes_impostos?: number
          lucro_bruto?: number
          lucro_liquido?: number
          period_end: string
          period_start: string
          receita_bruta?: number
          receita_liquida?: number
          resultado_financeiro?: number
          resultado_operacional?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          custo_produtos_servicos?: number
          data_snapshot?: Json
          deducoes?: number
          despesas_operacionais?: number
          id?: string
          impostos?: number
          lucro_antes_impostos?: number
          lucro_bruto?: number
          lucro_liquido?: number
          period_end?: string
          period_start?: string
          receita_bruta?: number
          receita_liquida?: number
          resultado_financeiro?: number
          resultado_operacional?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dre_snapshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          category_color: string
          created_at: string
          current_amount: number
          deadline: string | null
          description: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          category_color: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          category_color?: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          id: string
          name: string
          return_rate: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          return_rate: number
          start_date: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          return_rate?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          category_id: string | null
          client_id: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          payment_method: string
          recipient: string
          recurrence: string
          status: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          payment_method: string
          recipient: string
          recurrence: string
          status: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          payment_method?: string
          recipient?: string
          recurrence?: string
          status?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cost_percentage: number | null
          created_at: string
          description: string | null
          financial_cost_percentage: number | null
          id: string
          name: string
          operational_expense_percentage: number | null
          price: number
          tax_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_percentage?: number | null
          created_at?: string
          description?: string | null
          financial_cost_percentage?: number | null
          id?: string
          name: string
          operational_expense_percentage?: number | null
          price?: number
          tax_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_percentage?: number | null
          created_at?: string
          description?: string | null
          financial_cost_percentage?: number | null
          id?: string
          name?: string
          operational_expense_percentage?: number | null
          price?: number
          tax_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          category_id: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string
          due_date: string | null
          id: string
          payment_method: string | null
          product_id: string | null
          recipient: string | null
          recurrence: string | null
          recurrence_count: number | null
          status: string
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          due_date?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          recipient?: string | null
          recurrence?: string | null
          recurrence_count?: number | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          category?: string
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          recipient?: string | null
          recurrence?: string | null
          recurrence_count?: number | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_product_costs: {
        Args: { product_id: string; revenue_amount: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
