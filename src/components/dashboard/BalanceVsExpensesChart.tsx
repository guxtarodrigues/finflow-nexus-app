
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowUp, ArrowDown } from "lucide-react";

interface BalanceVsExpensesChartProps {
  totalBalance: number;
  totalExpenses: number;
}

export const BalanceVsExpensesChart = ({ totalBalance, totalExpenses }: BalanceVsExpensesChartProps) => {
  const chartData = [
    {
      name: 'Saldo vs Despesas',
      saldo: totalBalance,
      despesas: totalExpenses,
    }
  ];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Chart configuration for coloring the bars
  const chartConfig = {
    saldo: {
      label: "Saldo",
      color: "#10b981", // fin-green
      icon: ArrowUp
    },
    despesas: {
      label: "Despesas",
      color: "#ef4444", // fin-red
      icon: ArrowDown
    }
  };

  return (
    <ChartContainer 
      className="h-[300px] w-full" 
      config={chartConfig}
    >
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
        />
        <ChartTooltip
          content={({ active, payload }) => (
            <ChartTooltipContent 
              active={active} 
              payload={payload}
              formatter={(value) => formatCurrency(Number(value))}
            />
          )}
        />
        <Bar dataKey="saldo" fill="#10b981" name="Saldo" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
};
