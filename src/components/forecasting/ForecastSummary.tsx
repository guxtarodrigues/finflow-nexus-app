
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CircleDollarSign, CreditCard, Users, Calendar } from "lucide-react";
import { ForecastMetricCard } from "./ForecastMetricCard";

interface ForecastSummaryProps {
  nextMonthRevenue: number;
  nextMonthExpenses: number;
  nextMonthBalance: number;
  revenueTrend: number;
  expenseTrend: number;
  projectedClients: number;
  clientsTrend: number;
  bestMonth: string;
}

export const ForecastSummary = ({
  nextMonthRevenue,
  nextMonthExpenses,
  nextMonthBalance,
  revenueTrend,
  expenseTrend,
  projectedClients,
  clientsTrend,
  bestMonth
}: ForecastSummaryProps) => {
  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-fin-green" />
          Resumo das Previsões
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Projeções principais para o próximo mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <ForecastMetricCard
            title="Receita Prevista"
            description="Próximo mês"
            value={nextMonthRevenue}
            trend={revenueTrend}
            icon={<CircleDollarSign className="h-4 w-4 text-fin-green" />}
          />
          
          <ForecastMetricCard
            title="Despesas Previstas"
            description="Próximo mês"
            value={nextMonthExpenses}
            trend={expenseTrend}
            icon={<CreditCard className="h-4 w-4 text-fin-red" />}
          />
          
          <ForecastMetricCard
            title="Saldo Previsto"
            description="Próximo mês"
            value={nextMonthBalance}
            trend={revenueTrend - expenseTrend}
            icon={<TrendingUp className="h-4 w-4 text-[#8b5cf6]" />}
          />
          
          <ForecastMetricCard
            title="Novos Clientes"
            description="Previsão"
            value={projectedClients}
            trend={clientsTrend}
            icon={<Users className="h-4 w-4 text-[#3b82f6]" />}
            formatter={(value) => `${value.toFixed(0)}`}
          />
        </div>
        
        <div className="bg-[#252529] p-3 rounded-lg text-sm">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-fin-green mr-2" />
            <span className="font-medium">Insights Adicionais</span>
          </div>
          <ul className="space-y-2 text-[#94949F]">
            <li className="flex items-start">
              <span className="block w-2 h-2 rounded-full bg-fin-green mt-1.5 mr-2"></span>
              <span>Melhor mês previsto para receitas: <span className="text-white">{bestMonth}</span></span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 rounded-full bg-[#8b5cf6] mt-1.5 mr-2"></span>
              <span>Tendência de crescimento de receita nos próximos 3 meses: <span className="text-white">{revenueTrend > 0 ? 'Positiva' : 'Negativa'}</span></span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 mr-2"></span>
              <span>Sugestão: {revenueTrend < expenseTrend ? 'Focar em aumento de receitas' : 'Manter estratégia atual'}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
