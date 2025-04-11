
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ForecastChartProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: any[];
  loading: boolean;
  valueKey?: string;
  forecastKey?: string;
  xAxisKey?: string;
  formatValue?: (value: number) => string;
}

export const ForecastChart = ({
  title,
  description,
  icon,
  data,
  loading,
  valueKey = "value",
  forecastKey = "forecast",
  xAxisKey = "month",
  formatValue = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}: ForecastChartProps) => {
  const chartConfig = {
    value: {
      label: "Histórico",
      color: "#10b981" // fin-green
    },
    forecast: {
      label: "Previsão",
      color: "#8b5cf6" // purple
    }
  };

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-fin-green animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Sem dados para previsão</span>
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
                    dataKey={xAxisKey} 
                    stroke="#94949F"
                  />
                  <YAxis 
                    stroke="#94949F"
                    tickFormatter={(value) => `${formatValue(value).split(',')[0]}`}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => 
                      <ChartTooltipContent 
                        active={active} 
                        payload={payload}
                        label={label}
                        formatter={(value) => formatValue(Number(value))}
                      />
                    } 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={valueKey} 
                    name="Histórico"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={forecastKey} 
                    name="Previsão"
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
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
