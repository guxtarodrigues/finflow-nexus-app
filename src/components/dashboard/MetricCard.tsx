
import { ReactNode } from "react";
import { ArrowDown, ArrowUp, CircleDollarSign, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  icon?: "money" | "income" | "expense" | "savings";
}

export const MetricCard = ({ title, value, subtitle, trend = "neutral", icon = "money" }: MetricCardProps) => {
  const renderIcon = (): ReactNode => {
    switch (icon) {
      case "money":
        return (
          <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
            <PiggyBank className="h-7 w-7 text-fin-green" />
          </div>
        );
      case "income":
        return (
          <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
            <ArrowUp className="h-7 w-7 text-fin-green" />
          </div>
        );
      case "expense":
        return (
          <div className="h-14 w-14 rounded-full bg-fin-red/20 flex items-center justify-center">
            <ArrowDown className="h-7 w-7 text-fin-red" />
          </div>
        );
      case "savings":
        return (
          <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
            <CircleDollarSign className="h-7 w-7 text-fin-green" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg text-gray-300 font-normal">{title}</h3>
        {renderIcon()}
      </div>
      <div className="text-4xl font-bold text-white mb-3">{value}</div>
      <div className="flex items-center text-sm">
        {trend === "up" && (
          <ArrowUp size={14} className="text-fin-green mr-1" />
        )}
        {trend === "down" && (
          <ArrowDown size={14} className="text-fin-red mr-1" />
        )}
        <span
          className={cn(
            "text-gray-400",
            trend === "up" && "text-fin-green",
            trend === "down" && "text-fin-red"
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
};
