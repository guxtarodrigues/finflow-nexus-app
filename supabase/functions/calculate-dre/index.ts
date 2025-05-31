
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DRERequest {
  period_start: string;
  period_end: string;
  client_id?: string;
}

interface DREResult {
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
  detalhamento: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { period_start, period_end, client_id }: DRERequest = await req.json();

    // Buscar transações do período
    let transactionsQuery = supabaseClient
      .from("transactions")
      .select(`
        *,
        categories:category_id(name, type, dre_classification)
      `)
      .gte("date", period_start)
      .lte("date", period_end);

    if (client_id) {
      transactionsQuery = transactionsQuery.eq("client_id", client_id);
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery;

    if (transactionsError) {
      throw transactionsError;
    }

    // Inicializar valores do DRE
    let receita_bruta = 0;
    let deducoes = 0;
    let custo_produtos_servicos = 0;
    let despesas_operacionais = 0;
    let resultado_financeiro = 0;
    let impostos = 0;

    const detalhamento = {
      receitas: [],
      custos: [],
      despesas: [],
      financeiro: [],
      tributos: []
    };

    // Processar transações
    transactions?.forEach((transaction) => {
      const value = parseFloat(transaction.value.toString());
      const category = transaction.categories;
      const dreClassification = category?.dre_classification;

      const item = {
        description: transaction.description,
        category: category?.name || transaction.category,
        value: value,
        date: transaction.date
      };

      if (transaction.type === "income") {
        if (dreClassification === "deducoes") {
          deducoes += value;
          detalhamento.receitas.push({ ...item, tipo: "dedução" });
        } else {
          receita_bruta += value;
          detalhamento.receitas.push({ ...item, tipo: "receita_bruta" });
        }
      } else if (transaction.type === "expense") {
        switch (dreClassification) {
          case "custo_produtos_servicos":
            custo_produtos_servicos += value;
            detalhamento.custos.push(item);
            break;
          case "despesas_operacionais":
            despesas_operacionais += value;
            detalhamento.despesas.push(item);
            break;
          case "resultado_financeiro":
            resultado_financeiro -= value; // Despesa financeira é negativa
            detalhamento.financeiro.push({ ...item, tipo: "despesa" });
            break;
          case "impostos":
            impostos += value;
            detalhamento.tributos.push(item);
            break;
          default:
            // Se não classificado, considera como despesa operacional
            despesas_operacionais += value;
            detalhamento.despesas.push(item);
        }
      }
    });

    // Calcular DRE
    const receita_liquida = receita_bruta - deducoes;
    const lucro_bruto = receita_liquida - custo_produtos_servicos;
    const resultado_operacional = lucro_bruto - despesas_operacionais;
    const lucro_antes_impostos = resultado_operacional + resultado_financeiro;
    const lucro_liquido = lucro_antes_impostos - impostos;

    const dreResult: DREResult = {
      receita_bruta,
      deducoes,
      receita_liquida,
      custo_produtos_servicos,
      lucro_bruto,
      despesas_operacionais,
      resultado_operacional,
      resultado_financeiro,
      lucro_antes_impostos,
      impostos,
      lucro_liquido,
      periodo: {
        inicio: period_start,
        fim: period_end
      },
      detalhamento
    };

    return new Response(JSON.stringify(dreResult), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error calculating DRE:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
