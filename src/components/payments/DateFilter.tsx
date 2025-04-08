
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateFilterProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  dateFilterMode: "current" | "prev" | "next" | "custom";
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  currentDate: Date; // This is the current view date that will be used for display
}

export const DateFilter = ({
  dateRange,
  dateFilterMode,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onDateRangeChange,
  currentDate
}: DateFilterProps) => {
  
  // Format date range for display using Portuguese locale
  const formatDateRange = () => {
    if (dateFilterMode === "current" || dateFilterMode === "prev" || dateFilterMode === "next") {
      // Use currentDate for displaying the month name in the selector with Portuguese locale
      return `${format(currentDate, 'MMMM yyyy', { locale: ptBR })}`;
    } else {
      return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon"
        className="border-[#2A2A2E] bg-[#1F1F23]"
        onClick={onPrevMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="border-[#2A2A2E] bg-[#1F1F23] min-w-[180px]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to
            }}
            onSelect={(value) => {
              if (value?.from && value?.to) {
                onDateRangeChange({
                  from: value.from,
                  to: value.to
                });
              }
            }}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="outline" 
        size="icon"
        className="border-[#2A2A2E] bg-[#1F1F23]"
        onClick={onNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        className={`border-[#2A2A2E] ${dateFilterMode === "current" ? "bg-[#2A2A2E]" : "bg-[#1F1F23]"}`}
        onClick={onCurrentMonth}
      >
        Mês Atual
      </Button>
    </div>
  );
};
