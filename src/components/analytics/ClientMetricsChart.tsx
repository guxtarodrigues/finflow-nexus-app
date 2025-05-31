
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ClientData {
  name: string;
  value: number;
}

interface ClientMetrics {
  id: string;
  name: string;
  monthly_value: number;
}

export const ClientMetricsChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClientData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTopClients = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch active clients with their monthly values
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, monthly_value')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('monthly_value', { ascending: false })
          .limit(8);
        
        if (clientsError) throw clientsError;
        
        // Format client data for the chart
        const chartData = (clientsData as ClientMetrics[])
          .filter((client) => client.monthly_value !== null && client.monthly_value > 0)
          .map((client) => ({
            name: client.name,
            value: client.monthly_value || 0
          }));
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching top clients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopClients();
  }, [user]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Chart configuration
  const chartConfig = {
    value: {
      label: "Valor Mensal",
      color: "#10b981" // fin-green
    }
  };

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-6 w-6 text-fin-green" />
          Principais Clientes por Valor
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Os maiores contratos ativos em valor mensal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados de clientes com contratos ativos</span>
          </div>
        ) : (
          <div className="h-64">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="#94949F"
                    tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#94949F"
                    width={70}
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
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
                  <Bar 
                    dataKey="value" 
                    name="Valor Mensal"
                    fill="#10b981" 
                    radius={[0, 4, 4, 0]}
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
