import { useState } from "react";
import { format, parse, addMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Repeat } from "lucide-react";

interface Payment {
  id: string;
  due_date: string;
  description: string;
  value: number;
  status: string;
  recurrence?: string;
  recurrence_count?: number;
}

interface PaymentCalendarViewProps {
  payments: Payment[];
  currentDate: Date;
}

export const PaymentCalendarView = ({ payments, currentDate }: PaymentCalendarViewProps) => {
  const generateFuturePayments = () => {
    const allPayments: Payment[] = [...payments];
    
    payments.forEach(payment => {
      if (!payment.recurrence || payment.recurrence === 'Único') {
        return;
      }
      
      try {
        const originalDate = parse(payment.due_date, 'dd/MM/yyyy', new Date());
        
        const getMonthsToAdd = (recurrence: string) => {
          switch (recurrence) {
            case 'Mensal': return 1;
            case 'Trimestral': return 3;
            case 'Anual': return 12;
            default: return 0;
          }
        };
        
        const getFutureInstances = (recurrence: string) => {
          switch (recurrence) {
            case 'Mensal': return 24;
            case 'Trimestral': return 8;
            case 'Anual': return 2;
            default: return 0;
          }
        };
        
        const monthsToAdd = getMonthsToAdd(payment.recurrence);
        const futureInstances = getFutureInstances(payment.recurrence);
        
        if (monthsToAdd > 0) {
          for (let i = 1; i <= futureInstances; i++) {
            const futureDate = addMonths(originalDate, monthsToAdd * i);
            
            allPayments.push({
              id: `${payment.id}-future-${i}`,
              due_date: format(futureDate, 'dd/MM/yyyy'),
              description: `${payment.description} (Recorrente)`,
              value: payment.value,
              status: 'pending',
              recurrence: payment.recurrence,
              recurrence_count: i
            });
          }
        }
      } catch (error) {
        console.error(`Error generating future payments for: ${payment.description}`, error);
      }
    });
    
    return allPayments;
  };

  const allPayments = generateFuturePayments();

  const getPaymentsForDate = (date: Date) => {
    return allPayments.filter(payment => {
      try {
        const paymentDate = parse(payment.due_date, 'dd/MM/yyyy', new Date());
        
        return (
          date.getDate() === paymentDate.getDate() &&
          date.getMonth() === paymentDate.getMonth() &&
          date.getFullYear() === paymentDate.getFullYear()
        );
      } catch (error) {
        console.error(`Error parsing date: ${payment.due_date}`, error);
        return false;
      }
    });
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  return (
    <div className="rounded-md border border-[#2A2A2E] p-4">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold">
          Calendário de Pagamentos - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center p-2 font-semibold text-sm">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 h-24 bg-[#1F1F23]/30 rounded-md"></div>
        ))}
        
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayPayments = getPaymentsForDate(date);
          const isCurrentDate = isSameDay(date, new Date());
          
          return (
            <div 
              key={`day-${i + 1}`} 
              className={`p-2 h-24 min-h-[6rem] bg-[#1F1F23] rounded-md overflow-hidden ${
                isCurrentDate ? 'border border-fin-green' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isCurrentDate ? 'text-fin-green' : ''}`}>
                  {i + 1}
                </span>
                {dayPayments.length > 0 && (
                  <Badge className="bg-[#2A2A2E] text-white">
                    {dayPayments.length}
                  </Badge>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {dayPayments.slice(0, 2).map((payment, index) => (
                  <div 
                    key={`payment-${payment.id}-${index}`}
                    className={`text-xs p-1 rounded truncate flex items-center ${
                      payment.status === 'completed' ? 'bg-fin-green/20 text-fin-green' :
                      payment.status === 'overdue' ? 'bg-fin-red/20 text-fin-red' :
                      'bg-[#2A2A2E]'
                    }`}
                  >
                    {payment.recurrence_count && (
                      <Repeat className="h-3 w-3 mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {payment.description} • {payment.value.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </span>
                  </div>
                ))}
                {dayPayments.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    + {dayPayments.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
