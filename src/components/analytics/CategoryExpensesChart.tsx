
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export const CategoryExpensesChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CategoryData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategoryExpenses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch expenses grouped by category
        const { data: expensesData, error } = await supabase
          .from('transactions')
          .select('category, value')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .order('value', { ascending: false });
        
        if (error) throw error;
        
        // Group and sum by category
        const categoryMap = new Map<string, number>();
        
        expensesData?.forEach(transaction => {
          const currentValue = categoryMap.get(transaction.category) || 0;
          categoryMap.set(transaction.category, currentValue + transaction.value);
        });
        
        // Convert to chart data format
        const chartData = Array.from(categoryMap.entries())
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Get top 8 categories
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching category expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryExpenses();
  }, [user]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Create chart configuration
  const chartConfig = data.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.color
    };
    return config;
  }, {} as Record<string, { label: string, color: string }>);

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          Análise de Gastos por Categoria
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Visualize seus maiores gastos por categorias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados de gastos por categoria</span>
          </div>
        ) : (
          <div className="h-64">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip 
                    content={({ active, payload }) => 
                      <ChartTooltipContent 
                        active={active} 
                        payload={payload}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    } 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
