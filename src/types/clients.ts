
export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  status: "active" | "inactive" | "prospect";
  product_id?: string;
  recurring_payment?: boolean;
  monthly_value?: number;
  payment_due_day?: number;
  contract_start?: string;
  contract_end?: string;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    price: number;
  };
}
