
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Plus, TrendingUp, Trash2, Edit, AlertTriangle, RefreshCw, CheckCircle2, CircleDollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GoalForm } from '@/components/goals/GoalForm';
import { UpdateProgressDialog } from '@/components/goals/UpdateProgressDialog';
import { useGoalService, Goal } from '@/services/goalService';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MetricCard } from '@/components/dashboard/MetricCard';

const Metas = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [isDeleteGoalOpen, setIsDeleteGoalOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { fetchGoals, createGoal, updateGoal, deleteGoal, updateGoalProgress } = useGoalService();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, [retryCount]);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching goals in Metas page...');
      const data = await fetchGoals();
      console.log('Fetched goals data in Metas page:', data);
      
      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        console.error('Unexpected data format in Metas page:', data);
        setGoals([]);
        setError('Formato de dados inválido. Tente novamente mais tarde.');
      }
    } catch (err: any) {
      console.error('Error loading goals:', err);
      setError('Não foi possível carregar as metas. Tente novamente mais tarde.');
      toast({
        title: "Erro ao carregar metas",
        description: err.message || 'Não foi possível carregar as metas',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleCreateGoal = async (formData: Omit<Goal, 'id' | 'user_id'>) => {
    try {
      const newGoal = await createGoal(formData);
      if (newGoal) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async (formData: Partial<Goal>) => {
    if (!selectedGoal?.id) return;
    
    try {
      const updatedGoal = await updateGoal(selectedGoal.id, formData);
      if (updatedGoal) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal?.id) return;
    
    try {
      const success = await deleteGoal(selectedGoal.id);
      if (success) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleUpdateProgress = async (newAmount: number) => {
    if (!selectedGoal?.id) return;
    
    try {
      const updatedGoal = await updateGoalProgress(selectedGoal.id, newAmount);
      if (updatedGoal) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const openEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditGoalOpen(true);
  };

  const openDeleteGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDeleteGoalOpen(true);
  };

  const openUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsUpdateProgressOpen(true);
  };

  // Calculate metrics for mini dashboard
  const calculateMetrics = () => {
    if (goals.length === 0) return {
      totalGoals: 0,
      completedGoals: 0,
      totalAmount: 0,
      overallProgress: 0
    };

    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => 
      goal.current_amount >= goal.target_amount
    ).length;
    const totalAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
    const currentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
    const overallProgress = totalAmount > 0 ? Math.round((currentAmount / totalAmount) * 100) : 0;

    return { totalGoals, completedGoals, totalAmount, overallProgress };
  };

  const { totalGoals, completedGoals, totalAmount, overallProgress } = calculateMetrics();

  if (error && user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
        </div>
        
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-400" />
            <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
            <p className="text-center text-[#94949F]">
              {error}
            </p>
            <Button 
              onClick={handleRetry}
              className="mt-4 flex items-center gap-2 border-fin-green text-fin-green hover:bg-fin-green/10"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
        <Button 
          className="bg-fin-green hover:bg-fin-green/90 text-black"
          onClick={() => setIsAddGoalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total de Metas"
          value={totalGoals.toString()}
          subtitle="Metas cadastradas"
          icon="money"
        />
        <MetricCard
          title="Metas Completas"
          value={completedGoals.toString()}
          subtitle={`${completedGoals > 0 && totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% do total`}
          trend={completedGoals > 0 ? "up" : "neutral"}
          icon="income"
        />
        <MetricCard
          title="Valor Total"
          value={`R$ ${totalAmount.toLocaleString('pt-BR')}`}
          subtitle="Soma de todas as metas"
          icon="savings"
        />
        <MetricCard
          title="Progresso Geral"
          value={`${overallProgress}%`}
          subtitle="Média de todas as metas"
          trend={overallProgress > 50 ? "up" : "neutral"}
          icon="income"
        />
      </div>

      {/* Goals List */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader className="pb-2 animate-pulse">
                  <div className="h-6 w-3/4 bg-[#2A2A2E] rounded mb-1"></div>
                  <div className="h-4 w-1/2 bg-[#2A2A2E] rounded"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-1/3 bg-[#2A2A2E] rounded"></div>
                      <div className="h-4 w-1/3 bg-[#2A2A2E] rounded"></div>
                    </div>
                    <div className="h-2 bg-[#2A2A2E] rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-2/5 bg-[#2A2A2E] rounded"></div>
                      <div className="h-4 w-1/5 bg-[#2A2A2E] rounded"></div>
                    </div>
                    <div className="h-10 bg-[#2A2A2E] rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : goals.length > 0 ? (
            goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <Card key={goal.id} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="mr-2 h-6 w-6" style={{ color: goal.category_color }} />
                        {goal.title}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#94949F] hover:text-white hover:bg-[#2A2A2E]"
                          onClick={() => openEditGoal(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#94949F] hover:text-red-500 hover:bg-[#2A2A2E]"
                          onClick={() => openDeleteGoal(goal)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-[#94949F]">
                      {goal.description || goal.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Meta: R$ {goal.target_amount.toLocaleString('pt-BR')}</span>
                        {goal.deadline && (
                          <span>Prazo: {format(new Date(goal.deadline), 'dd/MM/yyyy')}</span>
                        )}
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2 bg-[#2A2A2E]"
                        style={{ 
                          '--progress-color': goal.category_color 
                        } as React.CSSProperties}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          R$ {goal.current_amount.toLocaleString('pt-BR')} de R$ {goal.target_amount.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-fin-green font-medium">
                          {progress}%
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full border-fin-green text-fin-green hover:bg-fin-green/10"
                        onClick={() => openUpdateProgress(goal)}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Atualizar Progresso
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow col-span-3">
              <CardContent className="p-6 flex flex-col items-center space-y-4">
                <Target className="h-12 w-12 text-[#2A2A2E] mb-2" />
                <h2 className="text-xl font-semibold">Nenhuma meta cadastrada</h2>
                <p className="text-center text-[#94949F]">
                  Você ainda não possui metas financeiras cadastradas. Clique em "Nova Meta" para começar!
                </p>
                <Button 
                  variant="outline" 
                  className="border-fin-green text-fin-green hover:bg-fin-green/10 mt-2"
                  onClick={() => setIsAddGoalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Meta
                </Button>
              </CardContent>
            </Card>
          )}

          {goals.length > 0 && (
            <Card className="bg-[#1F1F23] border-[#2A2A2E] border-dashed text-white shadow flex flex-col items-center justify-center p-6 h-[245px]">
              <Plus className="h-12 w-12 text-[#2A2A2E] mb-2" />
              <p className="text-[#94949F] mb-4 text-center">Adicione uma nova meta financeira</p>
              <Button 
                variant="outline" 
                className="border-fin-green text-fin-green hover:bg-fin-green/10"
                onClick={() => setIsAddGoalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Create Goal Dialog */}
      <GoalForm
        open={isAddGoalOpen}
        onOpenChange={setIsAddGoalOpen}
        onSubmit={handleCreateGoal}
        mode="create"
      />

      {/* Edit Goal Dialog */}
      {selectedGoal && (
        <GoalForm
          open={isEditGoalOpen}
          onOpenChange={setIsEditGoalOpen}
          onSubmit={handleUpdateGoal}
          defaultValues={selectedGoal}
          mode="edit"
        />
      )}

      {/* Update Progress Dialog */}
      {selectedGoal && (
        <UpdateProgressDialog
          open={isUpdateProgressOpen}
          onOpenChange={setIsUpdateProgressOpen}
          onSubmit={handleUpdateProgress}
          goalTitle={selectedGoal.title}
          currentAmount={selectedGoal.current_amount}
          targetAmount={selectedGoal.target_amount}
        />
      )}

      {/* Delete Goal Confirmation */}
      <AlertDialog open={isDeleteGoalOpen} onOpenChange={setIsDeleteGoalOpen}>
        <AlertDialogContent className="bg-[#1F1F23] border-[#2A2A2E] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94949F]">
              Tem certeza que deseja excluir a meta "{selectedGoal?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2A2A2E] text-white border-[#3A3A3E] hover:bg-[#3A3A3E]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGoal}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Metas;
