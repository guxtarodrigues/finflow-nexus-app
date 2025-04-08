
import React from "react";
import { Check, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  status: string;
  onChange: (status: string) => void;
}

export const StatusSelect = ({ status, onChange }: StatusSelectProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <button
        type="button"
        onClick={() => onChange("pending")}
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
          "border border-white/10 hover:bg-amber-500/20",
          status === "pending" 
            ? "bg-amber-500/30 ring-2 ring-amber-500/50" 
            : "bg-white/5 backdrop-blur-md"
        )}
      >
        <Clock 
          className={cn(
            "h-8 w-8 mb-2",
            status === "pending" ? "text-amber-400" : "text-amber-500/70"
          )} 
        />
        <span className={cn(
          "font-medium",
          status === "pending" ? "text-amber-400" : "text-amber-500/70"
        )}>
          Pendente
        </span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange("completed")}
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
          "border border-white/10 hover:bg-green-500/20",
          status === "completed" 
            ? "bg-green-500/30 ring-2 ring-green-500/50" 
            : "bg-white/5 backdrop-blur-md"
        )}
      >
        <CheckCircle2 
          className={cn(
            "h-8 w-8 mb-2",
            status === "completed" ? "text-green-400" : "text-green-500/70"
          )} 
        />
        <span className={cn(
          "font-medium",
          status === "completed" ? "text-green-400" : "text-green-500/70"
        )}>
          Pago
        </span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange("overdue")}
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
          "border border-white/10 hover:bg-red-500/20",
          status === "overdue" 
            ? "bg-red-500/30 ring-2 ring-red-500/50" 
            : "bg-white/5 backdrop-blur-md"
        )}
      >
        <AlertCircle 
          className={cn(
            "h-8 w-8 mb-2",
            status === "overdue" ? "text-red-400" : "text-red-500/70"
          )} 
        />
        <span className={cn(
          "font-medium",
          status === "overdue" ? "text-red-400" : "text-red-500/70"
        )}>
          Atrasado
        </span>
      </button>
    </div>
  );
};
