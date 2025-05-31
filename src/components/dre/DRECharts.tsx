
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { DREData } from '@/hooks/useDREData';

interface DREChartsProps {
  data?: DREData;
  isLoading: boolean;
}

export const DRECharts: React.FC<DREChartsProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-pulse bg-muted rounded h-48 w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Dados para gráfico de barras - Estrutura do DRE
  const dreStructureData = [
    { name: 'Receita Bruta', value: data.receita_bruta, color: '#10b981' },
    { name: 'Deduções', value: data.deducoes, color: '#ef4444' },
    { name: 'Receita Líquida', value: data.receita_liquida, color: '#3b82f6' },
    { name: 'Custos', value: data.custo_produtos_servicos, color: '#f59e0b' },
    { name: 'Despesas Op.', value: data.despesas_operacionais, color: '#8b5cf6' },
    { name: 'Lucro Líquido', value: data.lucro_liquido, color: data.lucro_liquido >= 0 ? '#10b981' : '#ef4444' }
  ];

  // Dados para gráfico de pizza - Distribuição de Despesas
  const expenseDistribution = [
    { name: 'Custos', value: data.custo_produtos_servicos, color: '#f59e0b' },
    { name: 'Despesas Op.', value: data.despesas_operacionais, color: '#8b5cf6' },
    { name: 'Impostos', value: data.impostos, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Dados para margem de lucro
  const marginData = [
    { name: 'Margem Bruta', value: data.receita_bruta > 0 ? (data.lucro_bruto / data.receita_bruta) * 100 : 0 },
    { name: 'Margem Operacional', value: data.receita_bruta > 0 ? (data.resultado_operacional / data.receita_bruta) * 100 : 0 },
    { name: 'Margem Líquida', value: data.receita_bruta > 0 ? (data.lucro_liquido / data.receita_bruta) * 100 : 0 }
  ];

  // Dados para evolução (simulado - em implementação real seria histórico)
  const evolutionData = [
    { month: 'Jan', lucro: data.lucro_liquido * 0.8 },
    { month: 'Fev', lucro: data.lucro_liquido * 0.9 },
    { month: 'Mar', lucro: data.lucro_liquido },
  ];

  const chartConfig = {
    value: {
      color: '#3b82f6',
    },
    lucro: {
      color: '#10b981',
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Estrutura do DRE */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura do DRE</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={dreStructureData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={formatCurrency} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
              />
              <Bar dataKey="value" radius={4}>
                {dreStructureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <PieChart>
              <Pie
                data={expenseDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Margens de Lucro */}
      <Card>
        <CardHeader>
          <CardTitle>Margens de Lucro (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={marginData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Margem']}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Evolução do Lucro (Simulado) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Lucro</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={evolutionData}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [formatCurrency(value), 'Lucro']}
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
