
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ForecastMetricCardProps {
  title: string;
  description: string;
  value: number | string;
  trend?: number;
  icon: React.ReactNode;
  formatter?: (value: number) => string;
}

export const ForecastMetricCard = ({
  title,
  description,
  value,
  trend,
  icon,
  formatter = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}: ForecastMetricCardProps) => {
  const formattedValue = typeof value === 'number' ? formatter(value) : value;
  const trendColor = trend && trend > 0 ? 'text-fin-green' : 'text-fin-red';
  const trendIcon = trend && trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-[#94949F] text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-xl font-semibold">{formattedValue}</div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              {trendIcon}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
