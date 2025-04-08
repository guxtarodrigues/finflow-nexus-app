
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "investment";
  color?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  return_rate: number;
  start_date: string;
  end_date?: string | null;
  status: "active" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: "income" | "expense";
  date: string;
  category: string;
  category_id?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Payment {
  id: string;
  description: string;
  recipient: string;
  value: number;
  due_date: string;
  payment_method: string;
  recurrence: string;
  status: string;
  category_id?: string | null;
  client_id?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
