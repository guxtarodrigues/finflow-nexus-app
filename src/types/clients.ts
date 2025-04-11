
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  monthly_value: number | null;
  status: 'active' | 'inactive' | null;
  recurring_payment: boolean;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  payment_status?: string | null;
  last_payment_date?: string | null;
  payment_due_day?: number | null;
}

export interface NewClient {
  name: string;
  email: string | null;
  phone: string | null;
  contract_start: string | null;
  contract_end: string | null;
  monthly_value: number | null;
  status: 'active' | 'inactive';
  recurring_payment: boolean;
  description: string | null;
  user_id: string;
  payment_status?: string | null;
  last_payment_date?: string | null;
  payment_due_day?: number | null;
}
