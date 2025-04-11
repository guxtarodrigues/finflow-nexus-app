
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BarChart as BarChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyComparisonData {
  name: string;
  currentMonth: number;
  previousMonth: number;
  monthKey: string;
}

export const MonthlyComparison = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyComparisonData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMonthlyComparison = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const currentDate = new Date();
        const previousDate = subMonths(currentDate, 1);
        
        const currentMonthStart = startOfMonth(currentDate).toISOString();
        const currentMonthEnd = endOfMonth(currentDate).toISOString();
        const previousMonthStart = startOfMonth(previousDate).toISOString();
        const previousMonthEnd = endOfMonth(previousDate).toISOString();
        
        // Fetch current month transactions
        const { data: currentTransactions, error: currentError } = await supabase
          .from('transactions')
          .select('category, type, value')
          .eq('user_id', user.id)
          .gte('date', currentMonthStart)
          .lte('date', currentMonthEnd);
        
        if (currentError) throw currentError;
        
        // Fetch previous month transactions
        const { data: previousTransactions, error: previousError } = await supabase
          .from('transactions')
          .select('category, type, value')
          .eq('user_id', user.id)
          .gte('date', previousMonthStart)
          .lte('date', previousMonthEnd);
        
        if (previousError) throw previousError;
        
        // Calculate totals by category for each month
        const currentMonthByCategory: Record<string, { income: number, expense: number }> = {};
        const previousMonthByCategory: Record<string, { income: number, expense: number }> = {};
        
        // Process current month
        currentTransactions?.forEach(transaction => {
          if (!currentMonthByCategory[transaction.category]) {
            currentMonthByCategory[transaction.category] = { income: 0, expense: 0 };
          }
          
          if (transaction.type === 'income') {
            currentMonthByCategory[transaction.category].income += transaction.value;
          } else if (transaction.type === 'expense') {
            currentMonthByCategory[transaction.category].expense += transaction.value;
          }
        });
        
        // Process previous month
        previousTransactions?.forEach(transaction => {
          if (!previousMonthByCategory[transaction.category]) {
            previousMonthByCategory[transaction.category] = { income: 0, expense: 0 };
          }
          
          if (transaction.type === 'income') {
            previousMonthByCategory[transaction.category].income += transaction.value;
          } else if (transaction.type === 'expense') {
            previousMonthByCategory[transaction.category].expense += transaction.value;
          }
        });
        
        // Calculate top 5 categories by total transaction value
        const allCategories = new Set([
          ...Object.keys(currentMonthByCategory),
          ...Object.keys(previousMonthByCategory)
        ]);
        
        const categoryTotals = Array.from(allCategories).map(category => {
          const currentTotal = 
            (currentMonthByCategory[category]?.income || 0) - 
            (currentMonthByCategory[category]?.expense || 0);
            
          const previousTotal = 
            (previousMonthByCategory[category]?.income || 0) - 
            (previousMonthByCategory[category]?.expense || 0);
            
          return {
            category,
            total: Math.abs(currentTotal) + Math.abs(previousTotal)
          };
        });
        
        // Sort by total and get top 5
        const topCategories = categoryTotals
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map(item => item.category);
        
        // Format data for chart
        const chartData = topCategories.map(category => {
          const currentValue = 
            (currentMonthByCategory[category]?.income || 0) - 
            (currentMonthByCategory[category]?.expense || 0);
            
          const previousValue = 
            (previousMonthByCategory[category]?.income || 0) - 
            (previousMonthByCategory[category]?.expense || 0);
          
          return {
            name: category,
            currentMonth: currentValue,
            previousMonth: previousValue,
            monthKey: category
          };
        });
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching monthly comparison:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyComparison();
  }, [user]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };
  
  const currentMonthLabel = format(new Date(), 'MMM/yyyy');
  const previousMonthLabel = format(subMonths(new Date(), 1), 'MMM/yyyy');

  // Chart configuration
  const chartConfig = {
    currentMonth: {
      label: currentMonthLabel,
      color: "#10b981" // fin-green
    },
    previousMonth: {
      label: previousMonthLabel,
      color: "#6366f1" // indigo
    }
  };

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChartIcon className="mr-2 h-6 w-6 text-fin-green" />
          Comparação Mensal por Categoria
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Compare o saldo de categorias entre {previousMonthLabel} e {currentMonthLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados para comparação mensal</span>
          </div>
        ) : (
          <div className="h-64">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94949F"
                    tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
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
                  <Bar 
                    dataKey="previousMonth" 
                    name={previousMonthLabel}
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="currentMonth" 
                    name={currentMonthLabel}
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
