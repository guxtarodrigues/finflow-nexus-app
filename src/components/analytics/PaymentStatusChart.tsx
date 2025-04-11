
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CircleDollarSign } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { startOfMonth, endOfMonth } from 'date-fns';

interface StatusData {
  name: string;
  value: number;
  color: string;
  status: string; // Adding the missing status property to the interface
}

export const PaymentStatusChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatusData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get current month date range
        const now = new Date();
        const startDate = startOfMonth(now).toISOString();
        const endDate = endOfMonth(now).toISOString();
        
        // Fetch transactions for current month
        const { data: transactionsData, error } = await supabase
          .from('transactions')
          .select('status, value')
          .eq('user_id', user.id)
          .eq('type', 'income')
          .gte('due_date', startDate)
          .lte('due_date', endDate);
        
        if (error) throw error;
        
        // Group and sum by status
        const statusMap = new Map<string, number>();
        
        transactionsData?.forEach(transaction => {
          const status = transaction.status || 'unknown';
          const currentValue = statusMap.get(status) || 0;
          statusMap.set(status, currentValue + transaction.value);
        });
        
        // Map status to friendly names and colors
        const statusLabels: Record<string, {label: string, color: string}> = {
          'completed': { label: 'Recebido', color: '#10b981' }, // fin-green
          'pending': { label: 'Pendente', color: '#f59e0b' },   // amber
          'canceled': { label: 'Cancelado', color: '#ef4444' }, // fin-red
          'unknown': { label: 'Não definido', color: '#6b7280' } // gray
        };
        
        // Convert to chart data format
        const chartData = Array.from(statusMap.entries())
          .map(([status, value]) => ({
            name: statusLabels[status]?.label || status,
            status, // Include the status field in the chartData
            value,
            color: statusLabels[status]?.color || '#6b7280'
          }));
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentStatus();
  }, [user]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Create chart configuration
  const chartConfig = data.reduce((config, item) => {
    config[item.status] = {
      label: item.name,
      color: item.color
    };
    return config;
  }, {} as Record<string, { label: string, color: string }>);

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <CircleDollarSign className="mr-2 h-6 w-6 text-fin-green" />
          Status de Recebimentos (Mês Atual)
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Distribuição do status de pagamentos deste mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados de recebimentos para este mês</span>
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
                    nameKey="status"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend formatter={(value, entry, index) => data[index].name} />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#1F1F23] p-2 border border-[#2A2A2E] rounded">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-fin-green">{formatCurrency(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
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
