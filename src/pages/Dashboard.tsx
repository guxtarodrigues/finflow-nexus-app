
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CircleDollarSign, TrendingUp, FileText, Clock, Users, CreditCard, CheckCircle, TimerIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isAfter, isBefore, parseISO, isEqual } from "date-fns";
import { Client } from "@/types/clients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BalanceVsExpensesChart } from "@/components/dashboard/BalanceVsExpensesChart";

interface Payment {
  id: string;
  description: string;
  due_date: string;
  recipient: string;
  value: number;
  recurrence: string;
  status: string;
}

interface FinancialData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalSavings: number;
  yearlyForecast: number;
  nextMonthForecast: number;
  activeClients: number;
  taxPayable: number;
  upcomingPayments: Payment[];
  clientsIncome: number;
  paymentsReceived: number;
  pendingPayments: number;
  overduePayments: number;
  totalIncome: number;
  totalExpenses: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalSavings: 0,
    yearlyForecast: 0,
    nextMonthForecast: 0,
    activeClients: 0,
    taxPayable: 0,
    upcomingPayments: [],
    clientsIncome: 0,
    paymentsReceived: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const now = new Date();
      
      // Buscar todas as transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);
      
      if (transactionsError) throw transactionsError;
      
      // Buscar todos os pagamentos
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id);
      
      if (paymentsError) throw paymentsError;
      
      // Buscar clientes ativos
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);
      
      if (clientsError) throw clientsError;
      
      const clients = clientsData as Client[] || [];
      const activeClients = clients.filter(client => client.status === 'active');
      
      // Calcular receitas totais (transações de entrada + receitas de clientes)
      const incomeTransactions = transactions?.filter(tx => tx.type === 'income') || [];
      const totalIncomeFromTransactions = incomeTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      
      // Calcular despesas totais (transações de saída)
      const expenseTransactions = transactions?.filter(tx => tx.type === 'expense') || [];
      const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      
      // Calcular receitas mensais de clientes ativos
      const monthlyClientsIncome = activeClients
        .filter(client => 
          client.recurring_payment && 
          client.monthly_value && 
          (!client.contract_end || new Date(client.contract_end) >= now)
        )
        .reduce((sum, client) => sum + (client.monthly_value || 0), 0);
      
      // Receitas e despesas do mês atual
      const currentMonthTransactions = transactions?.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= currentMonthStart && txDate <= currentMonthEnd;
      }) || [];
      
      const currentMonthIncome = currentMonthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.value), 0);
      
      const currentMonthExpense = currentMonthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.value), 0);
      
      // Total de receitas (transações + clientes)
      const totalIncome = totalIncomeFromTransactions + monthlyClientsIncome;
      
      // Saldo total real (receitas - despesas)
      const totalBalance = totalIncome - totalExpenses;
      
      // Calcular pagamentos por status
      const paymentsReceived = payments
        ?.filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      const pendingPayments = payments
        ?.filter(payment => 
          payment.status === 'pending' && 
          new Date(payment.due_date) >= now
        )
        .reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      const overduePayments = payments
        ?.filter(payment => 
          payment.status === 'pending' && 
          new Date(payment.due_date) < now
        )
        .reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      // Próximos pagamentos (5 primeiros pendentes)
      const upcomingPayments = payments
        ?.filter(payment => payment.status === 'pending')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5) || [];
      
      // Previsões baseadas em dados reais
      const monthlyIncomeAverage = totalIncome / 12; // Média mensal baseada no total
      const monthlyExpenseAverage = totalExpenses / 12; // Média mensal baseada no total
      const yearlyForecast = (monthlyIncomeAverage * 12) - (monthlyExpenseAverage * 12);
      const nextMonthForecast = monthlyIncomeAverage - monthlyExpenseAverage;
      
      // Impostos calculados sobre receita total (6%)
      const taxPayable = totalIncome * 0.06;
      
      // Economias estimadas (20% do saldo positivo)
      const totalSavings = totalBalance > 0 ? totalBalance * 0.2 : 0;
      
      setFinancialData({
        totalBalance,
        monthlyIncome: currentMonthIncome + monthlyClientsIncome,
        monthlyExpense: currentMonthExpense,
        totalSavings,
        yearlyForecast,
        nextMonthForecast,
        activeClients: activeClients.length,
        taxPayable,
        upcomingPayments: upcomingPayments as Payment[] || [],
        clientsIncome: monthlyClientsIncome,
        paymentsReceived,
        pendingPayments,
        overduePayments,
        totalIncome,
        totalExpenses
      });
    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    navigate('/movimentacoes');
  };

  const handleManagePayments = () => {
    navigate('/pagamentos');
  };
  
  const handleManageClients = () => {
    navigate('/clientes');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Visão geral das suas finanças" 
        onNewTransaction={handleNewTransaction}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="forecast">Previsões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Saldo Total"
              value={formatCurrency(financialData.totalBalance)}
              subtitle={`Receitas: ${formatCurrency(financialData.totalIncome)} | Despesas: ${formatCurrency(financialData.totalExpenses)}`}
              icon="money"
              trend={financialData.totalBalance >= 0 ? "up" : "down"}
            />
            <MetricCard
              title="Receita Mensal"
              value={formatCurrency(financialData.monthlyIncome)}
              subtitle={`Transações + Clientes (${financialData.activeClients} ativos)`}
              trend="up"
              icon="income"
            />
            <MetricCard
              title="Despesa Mensal"
              value={formatCurrency(financialData.monthlyExpense)}
              subtitle="Gastos do mês atual"
              trend="down"
              icon="expense"
            />
            <MetricCard
              title="Meta de Economia"
              value={formatCurrency(financialData.totalSavings)}
              subtitle="20% do saldo positivo"
              icon="savings"
            />
          </div>

          <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
            <div className="mb-4">
              <h3 className="text-lg text-gray-300 font-normal">Saldo Total vs Despesas Mensais</h3>
              <p className="text-sm text-gray-400">Comparativo entre saldo total acumulado e despesas do mês</p>
            </div>
            <BalanceVsExpensesChart 
              totalBalance={financialData.totalBalance} 
              totalExpenses={financialData.monthlyExpense}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Pagamentos Recebidos</h3>
                <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-fin-green" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.paymentsReceived)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Pagamentos confirmados</span>
              </div>
            </div>
            
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Pendentes</h3>
                <div className="h-14 w-14 rounded-full bg-[#FEC6A1]/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-[#FEC6A1]" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.pendingPayments)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Aguardando pagamento</span>
              </div>
            </div>
            
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Em Atraso</h3>
                <div className="h-14 w-14 rounded-full bg-fin-red/20 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-fin-red" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.overduePayments)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-fin-red">Pagamentos vencidos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="fin-card md:col-span-1">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Imposto a Pagar (6%)</h3>
                <div className="fin-icon-wrapper fin-red-icon">
                  <FileText size={20} />
                </div>
              </div>
              <div className="fin-value">{formatCurrency(financialData.taxPayable)}</div>
              <div className="mt-2 text-sm text-fin-text-secondary">
                Sobre receita total: {formatCurrency(financialData.totalIncome)}
              </div>
            </div>

            <div className="fin-card md:col-span-2">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Próximos Pagamentos</h3>
              </div>
              <div className="mb-2 text-sm text-fin-text-secondary">
                Pagamentos programados por vencimento
              </div>
              {financialData.upcomingPayments.length > 0 ? (
                <div className="space-y-2">
                  {financialData.upcomingPayments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-[#1F1F23] rounded-md">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-amber-500 mr-2" />
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-xs text-fin-text-secondary">
                            {format(new Date(payment.due_date), 'dd/MM/yyyy')} • {payment.recipient}
                            {payment.recurrence && payment.recurrence !== 'once' && (
                              <span className="ml-1 text-fin-green">• Recorrente</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(Number(payment.value))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-fin-text-secondary">
                  Nenhum pagamento programado.
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="text-fin-green border-fin-green hover:bg-fin-green/10"
                  onClick={handleManagePayments}
                >
                  Gerenciar pagamentos
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Resumo Financeiro</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <CircleDollarSign size={20} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-fin-text-secondary">Total de Receitas:</span>
                  <span className="text-fin-green font-semibold">{formatCurrency(financialData.totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fin-text-secondary">Total de Despesas:</span>
                  <span className="text-fin-red font-semibold">{formatCurrency(financialData.totalExpenses)}</span>
                </div>
                <div className="border-t border-[#2A2A2E] pt-2 flex justify-between">
                  <span className="text-white font-medium">Resultado:</span>
                  <span className={`font-bold ${financialData.totalBalance >= 0 ? 'text-fin-green' : 'text-fin-red'}`}>
                    {formatCurrency(financialData.totalBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Clientes Ativos</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <Users size={20} />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">{financialData.activeClients}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-fin-text-secondary">Receita mensal:</span>
                  <span className="text-fin-green">{formatCurrency(financialData.clientsIncome)}</span>
                </div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    className="text-fin-green p-0 h-auto"
                    onClick={handleManageClients}
                  >
                    Gerenciar clientes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Previsão Anual</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="fin-value">{formatCurrency(financialData.yearlyForecast)}</div>
              <div className="mt-2 text-sm text-fin-text-secondary">
                Baseado na média atual de receitas e despesas
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Previsão Próximo Mês</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="fin-value">{formatCurrency(financialData.nextMonthForecast)}</div>
              <div className="mt-2 text-sm text-fin-text-secondary">
                Projeção baseada em médias históricas
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Performance</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-fin-text-secondary">Taxa de sucesso:</span>
                  <span className="text-fin-green">
                    {financialData.totalIncome > 0 ? 
                      `${((financialData.paymentsReceived / (financialData.paymentsReceived + financialData.pendingPayments + financialData.overduePayments)) * 100 || 0).toFixed(1)}%` 
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fin-text-secondary">Margem de lucro:</span>
                  <span className={financialData.totalIncome > 0 ? 'text-fin-green' : 'text-fin-red'}>
                    {financialData.totalIncome > 0 ? 
                      `${((financialData.totalBalance / financialData.totalIncome) * 100).toFixed(1)}%` 
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
