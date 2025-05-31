
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Users, TrendingUp, Calculator } from 'lucide-react';
import { DREFilters } from '@/components/dre/DREFilters';
import { DRETable } from '@/components/dre/DRETable';
import { DRECharts } from '@/components/dre/DRECharts';
import { DREComparison } from '@/components/dre/DREComparison';
import { DREExport } from '@/components/dre/DREExport';
import { useDREData } from '@/hooks/useDREData';

export interface DREFiltersState {
  period_start: string;
  period_end: string;
  client_id?: string;
  period_type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

const DRE = () => {
  const [filters, setFilters] = useState<DREFiltersState>({
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    period_type: 'monthly'
  });

  const [comparisonFilters, setComparisonFilters] = useState<DREFiltersState | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: dreData, isLoading, error, refetch } = useDREData(filters);
  const { data: comparisonData } = useDREData(comparisonFilters, { enabled: !!comparisonFilters });

  const handleFiltersChange = (newFilters: DREFiltersState) => {
    setFilters(newFilters);
  };

  const handleComparisonToggle = () => {
    if (comparisonFilters) {
      setComparisonFilters(null);
    } else {
      // Criar filtros para período anterior
      const startDate = new Date(filters.period_start);
      const endDate = new Date(filters.period_end);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      
      const prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

      setComparisonFilters({
        ...filters,
        period_start: prevStartDate.toISOString().split('T')[0],
        period_end: prevEndDate.toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">DRE - Demonstração do Resultado</h1>
          <p className="text-muted-foreground">
            Análise completa dos resultados financeiros do período
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={comparisonFilters ? "default" : "outline"}
            onClick={handleComparisonToggle}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Comparar Períodos</span>
          </Button>
          
          <DREExport 
            dreData={dreData} 
            filters={filters}
            comparisonData={comparisonData}
            comparisonFilters={comparisonFilters}
          />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DREFilters 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DRETable 
            data={dreData} 
            isLoading={isLoading} 
            error={error}
            compact={true}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <DRETable 
            data={dreData} 
            isLoading={isLoading} 
            error={error}
            compact={false}
            showDetails={true}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <DRECharts data={dreData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {comparisonFilters ? (
            <DREComparison 
              currentData={dreData}
              comparisonData={comparisonData}
              currentPeriod={filters}
              comparisonPeriod={comparisonFilters}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Comparação de Períodos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Ative a comparação de períodos para ver a evolução dos seus resultados
                </p>
                <Button onClick={handleComparisonToggle}>
                  Ativar Comparação
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DRE;
