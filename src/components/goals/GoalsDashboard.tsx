
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { ForecastMetricCard } from "@/components/forecasting/ForecastMetricCard";
import { Target, TrendingUp, CircleDollarSign, Users } from 'lucide-react';
import { RadialBar, ResponsiveContainer, RadialBarChart, Legend, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface GoalsProgressData {
  name: string;
  progress: number;
  color: string;
}

export const GoalsDashboard = () => {
  // Mock data for the dashboard
  const overallProgress = 68;
  const totalGoals = 5;
  const completedGoals = 2;
  const inProgressGoals = 3;

  const categoryDistribution = [
    { name: 'Fundo de Emergência', value: 40, color: '#10B981' },
    { name: 'Viagem', value: 30, color: '#6366F1' },
    { name: 'Investimentos', value: 15, color: '#F59E0B' },
    { name: 'Equipamentos', value: 15, color: '#EC4899' },
  ];

  const goalsProgress: GoalsProgressData[] = [
    { name: 'Fundo de Emergência', progress: 40, color: '#10B981' },
    { name: 'Viagem', progress: 75, color: '#6366F1' },
    { name: 'Novo Equipamento', progress: 40, color: '#EC4899' },
    { name: 'Reserva para Educação', progress: 20, color: '#8B5CF6' },
    { name: 'Aposentadoria', progress: 15, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ForecastMetricCard
          title="Progresso Geral"
          description="Média de todas as metas"
          value={`${overallProgress}%`}
          trend={5.2}
          icon={<Target className="text-fin-green" />}
          formatter={(val) => `${val}%`}
        />

        <ForecastMetricCard
          title="Total de Metas"
          description="Número de metas ativas"
          value={totalGoals}
          icon={<Target className="text-fin-green" />}
          formatter={(val) => val.toString()}
        />

        <ForecastMetricCard
          title="Metas Completas"
          description="Metas finalizadas"
          value={completedGoals}
          trend={25}
          icon={<CircleDollarSign className="text-fin-green" />}
          formatter={(val) => val.toString()}
        />

        <ForecastMetricCard
          title="Metas em Progresso"
          description="Metas em andamento"
          value={inProgressGoals}
          icon={<TrendingUp className="text-fin-green" />}
          formatter={(val) => val.toString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Metas por Categoria</CardTitle>
            <CardDescription className="text-[#94949F]">
              Percentual do valor total por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentual']}
                    contentStyle={{ backgroundColor: '#2A2A2E', border: '1px solid #3A3A3E', borderRadius: '6px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardHeader>
            <CardTitle className="text-lg">Progresso das Metas</CardTitle>
            <CardDescription className="text-[#94949F]">
              Percentual concluído de cada meta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {goalsProgress.map((goal) => (
                <div key={goal.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-[#94949F]">{goal.progress}%</span>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className="h-2 bg-[#2A2A2E]" 
                    style={{ 
                      '--progress-color': goal.color 
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
