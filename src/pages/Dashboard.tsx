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
import { DateFilter } from "@/components/payments/DateFilter";

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
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Controle de período
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [dateFilterMode, setDateFilterMode] = useState<"current" | "prev" | "next" | "custom">("current");
  
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
    overduePayments: 0
  });

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user, dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const periodStart = dateRange.from;
      const periodEnd = dateRange.to;
      const now = new Date();
      
      console.log('Período selecionado:', format(periodStart, 'dd/MM/yyyy'), 'até', format(periodEnd, 'dd/MM/yyyy'));
      
      // Buscar transações do período selecionado
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', periodStart.toISOString())
        .lte('date', periodEnd.toISOString());
      
      if (transactionsError) throw transactionsError;
      
      console.log('Transações do período:', transactions?.length || 0);
      
      // Buscar pagamentos do período selecionado
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .gte('due_date', periodStart.toISOString())
        .lte('due_date', periodEnd.toISOString());
      
      if (paymentsError) throw paymentsError;
      
      console.log('Pagamentos do período:', payments?.length || 0);
      
      // Buscar clientes ativos
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);
      
      if (clientsError) throw clientsError;
      
      const clients = clientsData as Client[] || [];
      const activeClients = clients.filter(client => 
        client.status === 'active' && 
        (!client.contract_end || new Date(client.contract_end) >= periodStart)
      );
      
      // === CÁLCULOS DO PERÍODO SELECIONADO ===
      
      // Receitas do período (transações)
      const periodIncome = transactions
        ?.filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.value), 0) || 0;
      
      // Despesas do período
      const periodExpense = transactions
        ?.filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.value), 0) || 0;
      
      console.log('Receitas do período:', periodIncome);
      console.log('Despesas do período:', periodExpense);
      
      // Receitas de clientes ativos (proporcional ao período se for mensal)
      const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const monthlyClientsIncome = activeClients
        .filter(client => 
          client.recurring_payment && 
          client.monthly_value && 
          (!client.contract_start || new Date(client.contract_start) <= periodEnd) &&
          (!client.contract_end || new Date(client.contract_end) >= periodStart)
        )
        .reduce((sum, client) => {
          const monthlyValue = client.monthly_value || 0;
          // Se o período for um mês completo, retorna o valor mensal
          // Senão, calcula proporcional aos dias
          if (daysInPeriod >= 28 && daysInPeriod <= 31) {
            return sum + monthlyValue;
          } else {
            return sum + (monthlyValue * daysInPeriod / 30);
          }
        }, 0);
      
      console.log('Receita de clientes do período:', monthlyClientsIncome);
      
      // === PAGAMENTOS DO PERÍODO ===
      
      // Pagamentos recebidos no período
      const periodPaymentsReceived = payments
        ?.filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      // Pagamentos pendentes no período (ainda dentro do prazo)
      const periodPendingPayments = payments
        ?.filter(payment => {
          if (payment.status !== 'pending') return false;
          const dueDate = new Date(payment.due_date);
          return dueDate >= now;
        })
        .reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      // Pagamentos em atraso (vencidos até hoje, independente do período)
      const { data: overduePaymentsData, error: overdueError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .lt('due_date', now.toISOString());
      
      if (overdueError) throw overdueError;
      
      const overduePayments = overduePaymentsData
        ?.reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      console.log('Pagamentos recebidos no período:', periodPaymentsReceived);
      console.log('Pagamentos pendentes no período:', periodPendingPayments);
      console.log('Pagamentos em atraso (total):', overduePayments);
      
      // === SALDO TOTAL (HISTÓRICO) ===
      
      // Para o saldo total, buscar TODAS as transações e pagamentos históricos
      const { data: allTransactions, error: allTransactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);
      
      if (allTransactionsError) throw allTransactionsError;
      
      const { data: allCompletedPayments, error: allPaymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'completed');
      
      if (allPaymentsError) throw allPaymentsError;
      
      const allTimeIncome = allTransactions
        ?.filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.value), 0) || 0;
      
      const allTimeExpense = allTransactions
        ?.filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.value), 0) || 0;
      
      const allTimePaymentsReceived = allCompletedPayments
        ?.reduce((sum, payment) => sum + Number(payment.value), 0) || 0;
      
      // Saldo total = receitas históricas + pagamentos recebidos históricos - despesas históricas
      const totalBalance = allTimeIncome + allTimePaymentsReceived - allTimeExpense;
      
      console.log('Saldo total histórico:', totalBalance);
      
      // Próximos pagamentos (independente do período)
      const { data: upcomingPaymentsData, error: upcomingError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .gte('due_date', now.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (upcomingError) throw upcomingError;
      
      // Receita total do período (transações + clientes)
      const totalPeriodIncome = periodIncome + monthlyClientsIncome + periodPaymentsReceived;
      
      // Previsões baseadas nos dados do período
      const monthlyIncomeAverage = totalPeriodIncome;
      const monthlyExpenseAverage = periodExpense;
      const yearlyForecast = (monthlyIncomeAverage * 12) - (monthlyExpenseAverage * 12);
      const nextMonthForecast = monthlyIncomeAverage - monthlyExpenseAverage;
      
      // Impostos sobre receita do período (6%)
      const taxPayable = totalPeriodIncome * 0.06;
      
      // Economias estimadas (20% do saldo positivo)
      const totalSavings = totalBalance > 0 ? totalBalance * 0.2 : 0;
      
      setFinancialData({
        totalBalance,
        monthlyIncome: totalPeriodIncome,
        monthlyExpense: periodExpense,
        totalSavings,
        yearlyForecast,
        nextMonthForecast,
        activeClients: activeClients.length,
        taxPayable,
        upcomingPayments: upcomingPaymentsData as Payment[] || [],
        clientsIncome: monthlyClientsIncome,
        paymentsReceived: periodPaymentsReceived,
        pendingPayments: periodPendingPayments,
        overduePayments
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

  const handlePrevMonth = () => {
    const prevMonth = subMonths(dateRange.from, 1);
    setDateRange({
      from: startOfMonth(prevMonth),
      to: endOfMonth(prevMonth)
    });
    setDateFilterMode("prev");
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(dateRange.from, 1);
    setDateRange({
      from: startOfMonth(nextMonth),
      to: endOfMonth(nextMonth)
    });
    setDateFilterMode("next");
  };

  const handleCurrentMonth = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    });
    setDateFilterMode("current");
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateFilterMode("custom");
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

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Período: {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
        </h2>
        <DateFilter
          dateRange={dateRange}
          dateFilterMode={dateFilterMode}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onCurrentMonth={handleCurrentMonth}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

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
              subtitle="Acumulado histórico (receitas - despesas)"
              icon="money"
              trend={financialData.totalBalance >= 0 ? "up" : "down"}
            />
            <MetricCard
              title="Receita do Período"
              value={formatCurrency(financialData.monthlyIncome)}
              subtitle={`Transações + Clientes + Pagamentos (${financialData.activeClients} ativos)`}
              trend="up"
              icon="income"
            />
            <MetricCard
              title="Despesa do Período"
              value={formatCurrency(financialData.monthlyExpense)}
              subtitle="Gastos do período selecionado"
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
              <h3 className="text-lg text-gray-300 font-normal">Saldo Total vs Despesas do Período</h3>
              <p className="text-sm text-gray-400">Comparativo entre saldo total acumulado e despesas do período</p>
            </div>
            <BalanceVsExpensesChart 
              totalBalance={financialData.totalBalance} 
              totalExpenses={financialData.monthlyExpense}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Recebidos (Período)</h3>
                <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-fin-green" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.paymentsReceived)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Pagamentos confirmados no período</span>
              </div>
            </div>
            
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Pendentes (Período)</h3>
                <div className="h-14 w-14 rounded-full bg-[#FEC6A1]/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-[#FEC6A1]" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.pendingPayments)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Aguardando pagamento no período</span>
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
                <span className="text-fin-red">Pagamentos vencidos (total)</span>
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
                Sobre receita do período: {formatCurrency(financialData.monthlyIncome)}
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
