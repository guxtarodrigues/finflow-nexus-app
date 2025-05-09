
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  due_date: string;
  description: string;
  value: number;
  status: string;
  recipient: string;
  payment_method: string;
  recurrence: string;
  category_id?: string;
}

interface PaymentCalendarViewProps {
  payments: Payment[];
  currentDate: Date;
  onPaymentClick?: (payment: Payment) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

export const PaymentCalendarView = ({ 
  payments, 
  currentDate,
  onPaymentClick,
  onMonthChange 
}: PaymentCalendarViewProps) => {
  // Helper function to get payments for a specific date
  const getPaymentsForDate = (date: Date) => {
    return payments.filter(payment => {
      // Parse the date from dd/MM/yyyy format
      const [day, month, year] = payment.due_date.split('/').map(Number);
      return (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
      );
    });
  };

  // Get the number of days in the current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  return (
    <div className="rounded-md border border-[#2A2A2E] p-4">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold">
          Calendário de Pagamentos - {format(currentDate, 'MMMM yyyy')}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center p-2 font-semibold text-sm">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 h-24 bg-[#1F1F23]/30 rounded-md"></div>
        ))}
        
        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayPayments = getPaymentsForDate(date);
          const isCurrentDate = date.toDateString() === new Date().toDateString();
          
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
                    className={`text-xs p-1 rounded truncate ${
                      payment.status === 'completed' ? 'bg-fin-green/20 text-fin-green' :
                      payment.status === 'overdue' ? 'bg-fin-red/20 text-fin-red' :
                      'bg-[#2A2A2E]'
                    }`}
                    onClick={() => onPaymentClick && onPaymentClick(payment)}
                    style={{ cursor: onPaymentClick ? 'pointer' : 'default' }}
                  >
                    {payment.description} • {payment.value.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
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
