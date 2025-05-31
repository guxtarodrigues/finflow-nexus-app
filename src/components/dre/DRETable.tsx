
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { DREData } from '@/hooks/useDREData';

interface DRETableProps {
  data?: DREData;
  isLoading: boolean;
  error?: Error | null;
  compact?: boolean;
  showDetails?: boolean;
}

export const DRETable: React.FC<DRETableProps> = ({ 
  data, 
  isLoading, 
  error, 
  compact = false,
  showDetails = false 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPercentage = (value: number, base: number) => {
    if (base === 0) return 0;
    return ((value / base) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Calculando DRE...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-red-500">
            <p>Erro ao carregar DRE: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
        </CardContent>
      </Card>
    );
  }

  const dreItems = [
    {
      key: 'receita_bruta',
      label: 'Receita Bruta',
      value: data.receita_bruta,
      level: 0,
      type: 'positive',
      details: showDetails ? data.detalhamento.receitas.filter(r => r.tipo !== 'dedução') : []
    },
    {
      key: 'deducoes',
      label: '(-) Deduções',
      value: -data.deducoes,
      level: 1,
      type: 'negative',
      details: showDetails ? data.detalhamento.receitas.filter(r => r.tipo === 'dedução') : []
    },
    {
      key: 'receita_liquida',
      label: 'Receita Líquida',
      value: data.receita_liquida,
      level: 0,
      type: 'subtotal',
      details: []
    },
    {
      key: 'custo_produtos_servicos',
      label: '(-) Custo dos Produtos/Serviços',
      value: -data.custo_produtos_servicos,
      level: 1,
      type: 'negative',
      details: showDetails ? data.detalhamento.custos : []
    },
    {
      key: 'lucro_bruto',
      label: 'Lucro Bruto',
      value: data.lucro_bruto,
      level: 0,
      type: 'subtotal',
      details: []
    },
    {
      key: 'despesas_operacionais',
      label: '(-) Despesas Operacionais',
      value: -data.despesas_operacionais,
      level: 1,
      type: 'negative',
      details: showDetails ? data.detalhamento.despesas : []
    },
    {
      key: 'resultado_operacional',
      label: 'Resultado Operacional',
      value: data.resultado_operacional,
      level: 0,
      type: 'subtotal',
      details: []
    },
    {
      key: 'resultado_financeiro',
      label: '(+/-) Resultado Financeiro',
      value: data.resultado_financeiro,
      level: 1,
      type: data.resultado_financeiro >= 0 ? 'positive' : 'negative',
      details: showDetails ? data.detalhamento.financeiro : []
    },
    {
      key: 'lucro_antes_impostos',
      label: 'Lucro Antes dos Impostos',
      value: data.lucro_antes_impostos,
      level: 0,
      type: 'subtotal',
      details: []
    },
    {
      key: 'impostos',
      label: '(-) Impostos',
      value: -data.impostos,
      level: 1,
      type: 'negative',
      details: showDetails ? data.detalhamento.tributos : []
    },
    {
      key: 'lucro_liquido',
      label: 'Lucro Líquido',
      value: data.lucro_liquido,
      level: 0,
      type: 'total',
      details: []
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>DRE - {data.periodo.inicio} a {data.periodo.fim}</span>
          <div className="flex items-center space-x-2">
            {data.lucro_liquido >= 0 ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Lucro
              </Badge>
            ) : (
              <Badge variant="destructive">
                <TrendingDown className="h-3 w-3 mr-1" />
                Prejuízo
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              {!compact && <TableHead className="text-right">% Receita Bruta</TableHead>}
              {showDetails && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dreItems.map((item) => (
              <React.Fragment key={item.key}>
                <TableRow className={`
                  ${item.level === 0 ? 'font-semibold' : ''}
                  ${item.type === 'total' ? 'border-t-2 border-b-2 font-bold bg-muted/50' : ''}
                  ${item.type === 'subtotal' ? 'border-t font-medium bg-muted/25' : ''}
                `}>
                  <TableCell 
                    className={`${item.level === 1 ? 'pl-8' : ''}`}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell 
                    className={`text-right ${
                      item.value >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(Math.abs(item.value))}
                  </TableCell>
                  {!compact && (
                    <TableCell className="text-right text-muted-foreground">
                      {getPercentage(Math.abs(item.value), data.receita_bruta)}%
                    </TableCell>
                  )}
                  {showDetails && (
                    <TableCell>
                      {item.details.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSection(item.key)}
                            >
                              {expandedSections.has(item.key) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                
                {showDetails && expandedSections.has(item.key) && item.details.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <Collapsible open={expandedSections.has(item.key)}>
                        <CollapsibleContent>
                          <div className="p-4 bg-muted/10 border-l-4 border-primary/20">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Data</TableHead>
                                  <TableHead className="text-xs">Descrição</TableHead>
                                  <TableHead className="text-xs">Categoria</TableHead>
                                  <TableHead className="text-xs text-right">Valor</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {item.details.map((detail, idx) => (
                                  <TableRow key={idx} className="text-sm">
                                    <TableCell className="text-xs text-muted-foreground">
                                      {new Date(detail.date).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {detail.description}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {detail.category}
                                    </TableCell>
                                    <TableCell className="text-xs text-right">
                                      {formatCurrency(detail.value)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
