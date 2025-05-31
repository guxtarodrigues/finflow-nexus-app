
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DREFiltersProps {
  filters: {
    period_start: string;
    period_end: string;
    client_id?: string;
    period_type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  };
  onFiltersChange: (filters: any) => void;
}

export const DREFilters: React.FC<DREFiltersProps> = ({ filters, onFiltersChange }) => {
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handlePeriodTypeChange = (periodType: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);

    switch (periodType) {
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return; // Para 'custom', não altera as datas
    }

    onFiltersChange({
      ...filters,
      period_type: periodType,
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0]
    });
  };

  const handleQuickPeriods = (type: 'prev_month' | 'prev_quarter' | 'ytd') => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case 'prev_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'prev_quarter':
        const prevQuarter = Math.floor(today.getMonth() / 3) - 1;
        const year = prevQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
        const quarter = prevQuarter < 0 ? 3 : prevQuarter;
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, quarter * 3 + 3, 0);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
    }

    onFiltersChange({
      ...filters,
      period_type: 'custom',
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0]
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tipo de Período */}
      <div className="space-y-2">
        <Label htmlFor="period-type">Tipo de Período</Label>
        <Select 
          value={filters.period_type} 
          onValueChange={handlePeriodTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Início */}
      <div className="space-y-2">
        <Label htmlFor="start-date">Data Início</Label>
        <Input
          id="start-date"
          type="date"
          value={filters.period_start}
          onChange={(e) => onFiltersChange({
            ...filters,
            period_start: e.target.value
          })}
        />
      </div>

      {/* Data Fim */}
      <div className="space-y-2">
        <Label htmlFor="end-date">Data Fim</Label>
        <Input
          id="end-date"
          type="date"
          value={filters.period_end}
          onChange={(e) => onFiltersChange({
            ...filters,
            period_end: e.target.value
          })}
        />
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="client">Cliente (Opcional)</Label>
        <Select 
          value={filters.client_id || "all"} 
          onValueChange={(value) => onFiltersChange({
            ...filters,
            client_id: value === "all" ? undefined : value
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Períodos Rápidos */}
      <div className="md:col-span-2 lg:col-span-4 space-y-2">
        <Label>Períodos Rápidos</Label>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickPeriods('prev_month')}
          >
            Mês Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickPeriods('prev_quarter')}
          >
            Trimestre Anterior
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickPeriods('ytd')}
          >
            Ano até Agora
          </Button>
        </div>
      </div>
    </div>
  );
};
