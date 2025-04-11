import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Goal {
  id?: string;
  user_id?: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  category: string;
  category_color: string;
  deadline: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useGoalService = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async (): Promise<Goal[]> => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.warn('User not authenticated, cannot fetch goals');
        toast({
          title: "Usuário não autenticado",
          description: "Você precisa estar logado para ver suas metas.",
          variant: "destructive",
        });
        return [];
      }

      // Proceed with actual query
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        toast({
          title: "Erro ao carregar metas",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      console.log('Successfully fetched goals:', data);
      return data || [];
    } catch (error: any) {
      console.error('Error in fetchGoals:', error);
      toast({
        title: "Erro ao carregar metas",
        description: "Ocorreu um erro ao buscar suas metas. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal | null> => {
    if (!user) {
      toast({
        title: "Erro ao criar meta",
        description: "Você precisa estar logado para criar uma meta.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newGoal = {
        ...goal,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        toast({
          title: "Erro ao criar meta",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Meta criada",
        description: "Sua meta financeira foi criada com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Error in createGoal:', error);
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Erro ao atualizar meta",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Meta atualizada",
        description: "Sua meta financeira foi atualizada com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Error in updateGoal:', error);
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting goal:', error);
        toast({
          title: "Erro ao excluir meta",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Meta excluída",
        description: "Sua meta foi excluída com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Error in deleteGoal:', error);
      toast({
        title: "Erro ao excluir meta",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateGoalProgress = async (id: string, newAmount: number): Promise<Goal | null> => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal progress:', error);
        toast({
          title: "Erro ao atualizar progresso",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Progresso atualizado",
        description: "O progresso da sua meta foi atualizado com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Error in updateGoalProgress:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
  };
};
