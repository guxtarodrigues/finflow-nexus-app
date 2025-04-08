
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "investment";
  color?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  return_rate: number;
  start_date: string;
  end_date?: string;
  status: "active" | "completed" | "cancelled";
}
