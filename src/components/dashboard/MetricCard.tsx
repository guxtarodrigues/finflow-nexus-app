
import { ReactNode } from "react";
import { ArrowDown, ArrowUp, CircleDollarSign } from "lucide-react";
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
          <div className="fin-icon-wrapper fin-dollar-icon">
            <CircleDollarSign size={20} />
          </div>
        );
      case "income":
        return (
          <div className="fin-icon-wrapper fin-green-icon">
            <ArrowUp size={20} />
          </div>
        );
      case "expense":
        return (
          <div className="fin-icon-wrapper fin-red-icon">
            <ArrowDown size={20} />
          </div>
        );
      case "savings":
        return (
          <div className="fin-icon-wrapper fin-green-icon">
            <CircleDollarSign size={20} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <h3 className="fin-card-title">{title}</h3>
        </div>
        {renderIcon()}
      </div>
      <div className="fin-value">{value}</div>
      <div className="mt-2 flex items-center text-sm">
        {trend === "up" && (
          <ArrowUp size={14} className="text-fin-green mr-1" />
        )}
        {trend === "down" && (
          <ArrowDown size={14} className="text-fin-red mr-1" />
        )}
        <span
          className={cn(
            "text-fin-text-secondary",
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
