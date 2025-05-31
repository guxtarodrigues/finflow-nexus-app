
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DREData {
  receita_bruta: number;
  deducoes: number;
  receita_liquida: number;
  custo_produtos_servicos: number;
  lucro_bruto: number;
  despesas_operacionais: number;
  resultado_operacional: number;
  resultado_financeiro: number;
  lucro_antes_impostos: number;
  impostos: number;
  lucro_liquido: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  detalhamento: {
    receitas: Array<{
      description: string;
      category: string;
      value: number;
      date: string;
      tipo?: string;
    }>;
    custos: Array<{
      description: string;
      category: string;
      value: number;
      date: string;
    }>;
    despesas: Array<{
      description: string;
      category: string;
      value: number;
      date: string;
    }>;
    financeiro: Array<{
      description: string;
      category: string;
      value: number;
      date: string;
      tipo?: string;
    }>;
    tributos: Array<{
      description: string;
      category: string;
      value: number;
      date: string;
    }>;
  };
}

export interface DREFilters {
  period_start: string;
  period_end: string;
  client_id?: string;
}

export const useDREData = (
  filters: DREFilters | null, 
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ['dre', filters],
    queryFn: async (): Promise<DREData> => {
      if (!filters) throw new Error('Filtros são obrigatórios');

      const { data, error } = await supabase.functions.invoke('calculate-dre', {
        body: filters
      });

      if (error) {
        throw new Error(error.message || 'Erro ao calcular DRE');
      }

      return data;
    },
    enabled: !!filters && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useSaveDRESnapshot = () => {
  const saveDRESnapshot = async (dreData: DREData, filters: DREFilters) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const snapshot = {
      user_id: user.user.id,
      period_start: filters.period_start,
      period_end: filters.period_end,
      client_id: filters.client_id || null,
      receita_bruta: dreData.receita_bruta,
      deducoes: dreData.deducoes,
      receita_liquida: dreData.receita_liquida,
      custo_produtos_servicos: dreData.custo_produtos_servicos,
      lucro_bruto: dreData.lucro_bruto,
      despesas_operacionais: dreData.despesas_operacionais,
      resultado_operacional: dreData.resultado_operacional,
      resultado_financeiro: dreData.resultado_financeiro,
      lucro_antes_impostos: dreData.lucro_antes_impostos,
      impostos: dreData.impostos,
      lucro_liquido: dreData.lucro_liquido,
      data_snapshot: dreData.detalhamento
    };

    const { data, error } = await supabase
      .from('dre_snapshots')
      .insert(snapshot)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { saveDRESnapshot };
};
