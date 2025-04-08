
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category, Transaction } from "@/types";

const Movimentacoes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
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
        .in('type', ['income', 'expense'])
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

  const fetchTransactions = async () => {
    try {
      if (!user) return;
      
      setLoadingTransactions(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setTransactions(data as Transaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as movimentações",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movimentações</h1>
      <div className="grid gap-6">
        {loadingTransactions ? (
          <div>Carregando movimentações...</div>
        ) : transactions.length === 0 ? (
          <div>Nenhuma movimentação encontrada.</div>
        ) : (
          <div className="space-y-4">
            {/* Aqui você pode implementar o componente de lista de transações */}
            {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="p-4 bg-card rounded-lg border shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'} 
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(transaction.value)}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {transaction.category}
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

export default Movimentacoes;
