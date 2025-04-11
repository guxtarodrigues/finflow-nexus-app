
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface IncomeSourceData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e'];

export const IncomeSourcesChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IncomeSourceData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchIncomeSources = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch income transactions grouped by category
        const { data: incomeData, error } = await supabase
          .from('transactions')
          .select('category, value')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .order('value', { ascending: false });
        
        if (error) throw error;
        
        // Group and sum by category
        const categoryMap = new Map<string, number>();
        
        incomeData?.forEach(transaction => {
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
        console.error('Error fetching income sources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncomeSources();
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
          <PieChartIcon className="mr-2 h-6 w-6 text-fin-green" />
          Distribuição de Receitas
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Entenda a origem dos seus rendimentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados de fontes de receita</span>
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
