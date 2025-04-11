import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { ForecastMetricCard } from "@/components/forecasting/ForecastMetricCard";
import { Target, TrendingUp, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { RadialBar, ResponsiveContainer, RadialBarChart, Legend, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useGoalService, Goal } from '@/services/goalService';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export const GoalsDashboard = () => {
  const { fetchGoals } = useGoalService();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching goals data...');
        const data = await fetchGoals();
        console.log('Fetched goals data:', data);
        setGoals(data);
      } catch (err) {
        console.error('Error loading goals:', err);
        setError('Não foi possível carregar as metas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [fetchGoals]);

  const calculateMetrics = () => {
    if (goals.length === 0) return {
      overallProgress: 0,
      totalGoals: 0,
      completedGoals: 0,
      inProgressGoals: 0,
      categoryDistribution: [],
      goalsProgress: []
    };

    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => 
      goal.current_amount >= goal.target_amount
    ).length;
    const inProgressGoals = totalGoals - completedGoals;

    const overallProgress = Math.round(
      goals.reduce((sum, goal) => {
        const goalProgress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
        return sum + goalProgress;
      }, 0) / (totalGoals || 1)
    );

    const categoryTotals: Record<string, { total: number, color: string }> = {};
    
    goals.forEach(goal => {
      if (!categoryTotals[goal.category]) {
        categoryTotals[goal.category] = { total: 0, color: goal.category_color };
      }
      categoryTotals[goal.category].total += goal.target_amount;
    });

    const totalAmount = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
    
    const categoryDistribution: CategoryDistribution[] = Object.keys(categoryTotals).map(category => ({
      name: category,
      value: Math.round((categoryTotals[category].total / totalAmount) * 100),
      color: categoryTotals[category].color
    }));

    const goalsProgress = goals.map(goal => ({
      name: goal.title,
      progress: Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)),
      color: goal.category_color
    }));

    return {
      overallProgress,
      totalGoals,
      completedGoals,
      inProgressGoals,
      categoryDistribution,
      goalsProgress
    };
  };

  const {
    overallProgress,
    totalGoals,
    completedGoals,
    inProgressGoals,
    categoryDistribution,
    goalsProgress
  } = calculateMetrics();

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-400" />
            <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
            <p className="text-center text-[#94949F]">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-fin-green text-black rounded-md hover:bg-fin-green/90"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
              <CardHeader>
                <div className="h-6 w-24 bg-[#2A2A2E] rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-16 bg-[#2A2A2E] rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-[400px]">
              <CardHeader>
                <div className="h-6 w-36 bg-[#2A2A2E] rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-[#2A2A2E] rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
          trend={totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}
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
            {categoryDistribution.length > 0 ? (
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
                      label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
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
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-[#94949F]">Nenhuma meta cadastrada</p>
              </div>
            )}
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
              {goalsProgress.length > 0 ? (
                goalsProgress.map((goal) => (
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
                ))
              ) : (
                <div className="flex items-center justify-center h-60">
                  <p className="text-[#94949F]">Nenhuma meta cadastrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
