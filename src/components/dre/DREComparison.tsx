
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DREData } from '@/hooks/useDREData';

interface DREComparisonProps {
  currentData?: DREData;
  comparisonData?: DREData;
  currentPeriod: {
    period_start: string;
    period_end: string;
  };
  comparisonPeriod: {
    period_start: string;
    period_end: string;
  };
}

export const DREComparison: React.FC<DREComparisonProps> = ({
  currentData,
  comparisonData,
  currentPeriod,
  comparisonPeriod
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variation < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getVariationColor = (variation: number, isPositiveGood: boolean = true) => {
    if (variation === 0) return 'text-muted-foreground';
    const isGood = isPositiveGood ? variation > 0 : variation < 0;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  if (!currentData || !comparisonData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Carregando comparação...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comparisonItems = [
    {
      label: 'Receita Bruta',
      current: currentData.receita_bruta,
      previous: comparisonData.receita_bruta,
      isPositiveGood: true
    },
    {
      label: 'Deduções',
      current: currentData.deducoes,
      previous: comparisonData.deducoes,
      isPositiveGood: false
    },
    {
      label: 'Receita Líquida',
      current: currentData.receita_liquida,
      previous: comparisonData.receita_liquida,
      isPositiveGood: true
    },
    {
      label: 'Custo dos Produtos/Serviços',
      current: currentData.custo_produtos_servicos,
      previous: comparisonData.custo_produtos_servicos,
      isPositiveGood: false
    },
    {
      label: 'Lucro Bruto',
      current: currentData.lucro_bruto,
      previous: comparisonData.lucro_bruto,
      isPositiveGood: true
    },
    {
      label: 'Despesas Operacionais',
      current: currentData.despesas_operacionais,
      previous: comparisonData.despesas_operacionais,
      isPositiveGood: false
    },
    {
      label: 'Resultado Operacional',
      current: currentData.resultado_operacional,
      previous: comparisonData.resultado_operacional,
      isPositiveGood: true
    },
    {
      label: 'Resultado Financeiro',
      current: currentData.resultado_financeiro,
      previous: comparisonData.resultado_financeiro,
      isPositiveGood: true
    },
    {
      label: 'Lucro Antes dos Impostos',
      current: currentData.lucro_antes_impostos,
      previous: comparisonData.lucro_antes_impostos,
      isPositiveGood: true
    },
    {
      label: 'Impostos',
      current: currentData.impostos,
      previous: comparisonData.impostos,
      isPositiveGood: false
    },
    {
      label: 'Lucro Líquido',
      current: currentData.lucro_liquido,
      previous: comparisonData.lucro_liquido,
      isPositiveGood: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Resumo da Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Período Atual</p>
              <p className="text-lg font-semibold">
                {new Date(currentPeriod.period_start).toLocaleDateString('pt-BR')} - {new Date(currentPeriod.period_end).toLocaleDateString('pt-BR')}
              </p>
              <p className={`text-2xl font-bold ${currentData.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentData.lucro_liquido)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Período Anterior</p>
              <p className="text-lg font-semibold">
                {new Date(comparisonPeriod.period_start).toLocaleDateString('pt-BR')} - {new Date(comparisonPeriod.period_end).toLocaleDateString('pt-BR')}
              </p>
              <p className={`text-2xl font-bold ${comparisonData.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(comparisonData.lucro_liquido)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Variação</p>
              <div className="flex items-center justify-center space-x-2">
                {getVariationIcon(calculateVariation(currentData.lucro_liquido, comparisonData.lucro_liquido))}
                <span className={`text-2xl font-bold ${
                  getVariationColor(calculateVariation(currentData.lucro_liquido, comparisonData.lucro_liquido))
                }`}>
                  {calculateVariation(currentData.lucro_liquido, comparisonData.lucro_liquido).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(currentData.lucro_liquido - comparisonData.lucro_liquido)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Comparação Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Período Atual</TableHead>
                <TableHead className="text-right">Período Anterior</TableHead>
                <TableHead className="text-right">Variação (R$)</TableHead>
                <TableHead className="text-right">Variação (%)</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonItems.map((item, index) => {
                const variation = calculateVariation(item.current, item.previous);
                const absoluteVariation = item.current - item.previous;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.current)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.previous)}
                    </TableCell>
                    <TableCell className={`text-right ${
                      getVariationColor(variation, item.isPositiveGood)
                    }`}>
                      {formatCurrency(absoluteVariation)}
                    </TableCell>
                    <TableCell className={`text-right ${
                      getVariationColor(variation, item.isPositiveGood)
                    }`}>
                      {variation.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {getVariationIcon(variation)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
