
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onNewTransaction?: () => void;
}

export const DashboardHeader = ({ title, subtitle, onNewTransaction }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-fin-text-secondary">{subtitle}</p>
      </div>
      {onNewTransaction && (
        <Button 
          onClick={onNewTransaction}
          className="bg-fin-green hover:bg-fin-green/90 text-black rounded-2xl"
        >
          <PlusCircle size={16} className="mr-2" />
          Nova Transação
        </Button>
      )}
    </div>
  );
};
