
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'reminder' | 'warning' | 'info' | 'danger';
  active: boolean;
  created_at: string;
  updated_at: string;
  read: boolean;
  due_date: string | null;
  user_id: string;
  is_default?: boolean;
}

export interface CreateAlertInput {
  title: string;
  description: string;
  type: 'reminder' | 'warning' | 'info' | 'danger';
  active?: boolean;
  due_date?: string | null;
  is_default?: boolean;
}

export const DEFAULT_ALERTS: CreateAlertInput[] = [
  {
    title: "Pagamentos em Atraso",
    description: "Você possui pagamentos em atraso que precisam de atenção",
    type: "danger",
    active: true,
    is_default: true
  },
  {
    title: "Recebimentos Pendentes",
    description: "Há recebimentos pendentes que precisam ser conciliados",
    type: "warning",
    active: true,
    is_default: true
  },
  {
    title: "Metas Próximas do Vencimento",
    description: "Algumas metas financeiras estão próximas do prazo de vencimento",
    type: "reminder",
    active: true,
    is_default: true
  },
  {
    title: "Investimentos com Baixo Rendimento",
    description: "Alguns investimentos estão com rendimento abaixo do esperado",
    type: "info",
    active: true,
    is_default: true
  },
  {
    title: "Gastos Acima do Orçamento",
    description: "Seus gastos em algumas categorias estão acima do orçamento planejado",
    type: "warning",
    active: true,
    is_default: true
  }
];

export const useAlertService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const setupDefaultAlerts = async () => {
    if (!user) return;

    try {
      // Check if default alerts already exist
      const { data: existingDefaults, error: checkError } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_default', true);

      if (checkError) {
        console.error('Error checking default alerts:', checkError);
        return;
      }

      // If there are no default alerts, create them
      if (!existingDefaults || existingDefaults.length === 0) {
        for (const defaultAlert of DEFAULT_ALERTS) {
          await createAlert({
            ...defaultAlert,
            is_default: true
          });
        }
        console.log('Default alerts created');
      }
    } catch (error) {
      console.error('Error setting up default alerts:', error);
    }
  };

  const fetchAlerts = async () => {
    if (!user) return [];

    try {
      console.log('Fetching alerts...');
      
      // Set up default alerts if needed
      await setupDefaultAlerts();
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        throw new Error(error.message);
      }

      return data as Alert[];
    } catch (error: any) {
      console.error('Error in fetchAlerts:', error);
      throw new Error(error.message || 'Failed to fetch alerts');
    }
  };

  const fetchUnreadAlerts = async () => {
    if (!user) return [];

    try {
      await setupDefaultAlerts();
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('read', false)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread alerts:', error);
        throw new Error(error.message);
      }

      return data as Alert[];
    } catch (error: any) {
      console.error('Error in fetchUnreadAlerts:', error);
      throw new Error(error.message || 'Failed to fetch unread alerts');
    }
  };

  const createAlert = async (alertData: CreateAlertInput) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          ...alertData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Alert;
    } catch (error: any) {
      console.error('Error creating alert:', error);
      throw new Error(error.message || 'Failed to create alert');
    }
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Alert;
    } catch (error: any) {
      console.error('Error updating alert:', error);
      throw new Error(error.message || 'Failed to update alert');
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      throw new Error(error.message || 'Failed to delete alert');
    }
  };

  const markAlertAsRead = async (id: string) => {
    return updateAlert(id, { read: true });
  };

  const toggleAlertActive = async (id: string, active: boolean) => {
    return updateAlert(id, { active });
  };

  // React Query hooks
  const useAlerts = () => {
    return useQuery({
      queryKey: ['alerts'],
      queryFn: fetchAlerts,
      staleTime: 1000 * 60, // 1 minute
    });
  };

  const useUnreadAlerts = () => {
    return useQuery({
      queryKey: ['unreadAlerts'],
      queryFn: fetchUnreadAlerts,
      staleTime: 1000 * 60, // 1 minute
    });
  };

  const useCreateAlert = () => {
    return useMutation({
      mutationFn: createAlert,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['unreadAlerts'] });
        toast({
          title: "Alerta criado",
          description: "O alerta foi criado com sucesso",
        });
      },
    });
  };

  const useUpdateAlert = () => {
    return useMutation({
      mutationFn: ({ id, updates }: { id: string; updates: Partial<Alert> }) => 
        updateAlert(id, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['unreadAlerts'] });
        toast({
          title: "Alerta atualizado",
          description: "O alerta foi atualizado com sucesso",
        });
      },
    });
  };

  const useDeleteAlert = () => {
    return useMutation({
      mutationFn: deleteAlert,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['unreadAlerts'] });
        toast({
          title: "Alerta excluído",
          description: "O alerta foi excluído com sucesso",
        });
      },
    });
  };

  const useMarkAlertAsRead = () => {
    return useMutation({
      mutationFn: markAlertAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['unreadAlerts'] });
      },
    });
  };

  const useToggleAlertActive = () => {
    return useMutation({
      mutationFn: ({ id, active }: { id: string; active: boolean }) => 
        toggleAlertActive(id, active),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['unreadAlerts'] });
        toast({
          title: variables.active ? "Alerta ativado" : "Alerta desativado",
          description: variables.active 
            ? "O alerta foi ativado com sucesso" 
            : "O alerta foi desativado com sucesso",
        });
      },
    });
  };

  return {
    fetchAlerts,
    fetchUnreadAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    markAlertAsRead,
    toggleAlertActive,
    setupDefaultAlerts,
    useAlerts,
    useUnreadAlerts,
    useCreateAlert,
    useUpdateAlert,
    useDeleteAlert,
    useMarkAlertAsRead,
    useToggleAlertActive,
  };
};
