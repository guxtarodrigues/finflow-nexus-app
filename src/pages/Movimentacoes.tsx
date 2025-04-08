import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category, Transaction } from "@/types";

const Movimentacoes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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
      
      setCategories((data || []) as Category[]);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return (
    <div>
      <h1>Movimentações</h1>
      {/* Rest of the component implementation */}
    </div>
  );
};

export default Movimentacoes;
