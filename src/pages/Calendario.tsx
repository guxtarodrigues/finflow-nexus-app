
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

const Calendario = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Calendário Financeiro</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8">
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <CalendarIcon className="h-6 w-6 text-fin-green mr-2" />
              <h2 className="text-lg font-medium">Calendário</h2>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border-[#2A2A2E] rounded-md p-3"
            />
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow md:col-span-5">
          <CardContent className="pt-6">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                <div className="text-[#94949F] text-sm font-medium">Dom</div>
                <div className="text-[#94949F] text-sm font-medium">Seg</div>
                <div className="text-[#94949F] text-sm font-medium">Ter</div>
                <div className="text-[#94949F] text-sm font-medium">Qua</div>
                <div className="text-[#94949F] text-sm font-medium">Qui</div>
                <div className="text-[#94949F] text-sm font-medium">Sex</div>
                <div className="text-[#94949F] text-sm font-medium">Sáb</div>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square border border-[#2A2A2E] rounded-md flex flex-col p-1 text-sm"
                  >
                    <div className="text-right text-[#94949F]">{((i % 31) + 1)}</div>
                    {i % 7 === 0 && (
                      <div className="mt-auto">
                        <div className="text-xs bg-green-500/20 text-green-500 px-1 py-0.5 rounded text-center mb-1">Receita</div>
                      </div>
                    )}
                    {i % 5 === 0 && (
                      <div className="mt-auto">
                        <div className="text-xs bg-red-500/20 text-red-500 px-1 py-0.5 rounded text-center">Despesa</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendario;
