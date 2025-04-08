
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category, Client, Payment } from "@/types";

const Pagamentos = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      setLoadingCategories(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data as Category[]);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchClients = async () => {
    try {
      if (!user) return;
      
      setLoadingClients(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setClients(data as Client[]);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!user) return;
      
      setLoadingPayments(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      setPayments(data as Payment[]);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos",
        variant: "destructive",
      });
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchClients();
    fetchPayments();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pagamentos</h1>
      <div className="grid gap-6">
        {loadingPayments ? (
          <div>Carregando pagamentos...</div>
        ) : payments.length === 0 ? (
          <div>Nenhum pagamento encontrado.</div>
        ) : (
          <div className="space-y-4">
            {/* Aqui você pode implementar o componente de lista de pagamentos */}
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className="p-4 bg-card rounded-lg border shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{payment.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Destinatário: {payment.recipient}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(payment.value)}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status === 'pending' ? 'Pendente' :
                     payment.status === 'paid' ? 'Pago' : 'Atrasado'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {payment.payment_method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagamentos;
