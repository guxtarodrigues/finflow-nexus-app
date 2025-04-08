import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category, Client } from "@/types";

const Pagamentos = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories((data || []) as Category[]);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchClients = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setClients((data || []) as Client[]);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchClients();
  }, [user]);

  return (
    <div>
      <h1>Pagamentos</h1>
      {/* Rest of the component implementation */}
    </div>
  );
};

export default Pagamentos;
