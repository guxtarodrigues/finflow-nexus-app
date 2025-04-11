
export interface Transaction {
  id: string;
  date: string;
  due_date: string;
  description: string;
  category: string;
  type: string;
  value: number;
  status: string;
  recurrence?: string | null;
  recurrence_count?: number | null;
  client_id?: string | null;
}
