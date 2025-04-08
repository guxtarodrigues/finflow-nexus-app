
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CalendarioPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
        <p className="text-muted-foreground">
          Visualize seus eventos e compromissos financeiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar 
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarioPage;
