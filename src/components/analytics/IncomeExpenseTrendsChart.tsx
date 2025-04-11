
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
  monthKey: string;
}

export const IncomeExpenseTrendsChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Generate last 6 months data points
        const months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const month = subMonths(now, i);
          const startDate = startOfMonth(month);
          const endDate = endOfMonth(month);
          
          months.push({
            month: format(month, 'MMM/yyyy'),
            startDate,
            endDate,
            monthKey: format(month, 'yyyy-MM')
          });
        }
        
        // Fetch all transactions within the last 6 months
        const start = months[0].startDate.toISOString();
        const end = months[months.length - 1].endDate.toISOString();
        
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('type, value, date')
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end);
        
        if (error) throw error;
        
        // Process transactions by month
        const monthlyData = months.map(monthInfo => {
          const monthTransactions = transactions?.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= monthInfo.startDate && transactionDate <= monthInfo.endDate;
          }) || [];
          
          const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.value || 0), 0);
            
          const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.value || 0), 0);
            
          return {
            month: monthInfo.month,
            monthKey: monthInfo.monthKey,
            income,
            expense,
            profit: income - expense
          };
        });
        
        setData(monthlyData);
      } catch (error) {
        console.error('Error fetching monthly trends:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyTrends();
  }, [user]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Create chart configuration for colors
  const chartConfig = {
    income: {
      label: "Receitas",
      color: "#10b981" // fin-green
    },
    expense: {
      label: "Despesas",
      color: "#ef4444" // fin-red
    },
    profit: {
      label: "Lucro",
      color: "#8b5cf6" // purple
    }
  };

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-fin-green" />
          Tendências Financeiras
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Acompanhe a evolução de receitas, despesas e lucros
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados de tendências</span>
          </div>
        ) : (
          <div className="h-64">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94949F"
                  />
                  <YAxis 
                    stroke="#94949F" 
                    tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => 
                      <ChartTooltipContent 
                        active={active} 
                        payload={payload}
                        label={label}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    } 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Receitas"
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    name="Despesas"
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Lucro"
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
