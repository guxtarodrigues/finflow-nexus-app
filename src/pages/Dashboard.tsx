
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
    overduePayments: 0
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
      const nextMonthStart = startOfMonth(addMonths(new Date(), 1));
      const nextMonthEnd = endOfMonth(addMonths(new Date(), 1));
      const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
      const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
      
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);
      
      if (transactionsError) throw transactionsError;
      
      const { data: originalPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });
      
      if (paymentsError) throw paymentsError;
      
      let processedPayments: Payment[] = [];
      
      if (originalPayments && originalPayments.length > 0) {
        const currentDate = new Date();
        
        originalPayments.forEach(payment => {
          processedPayments.push(payment as Payment);
          
          if (payment.recurrence && payment.recurrence !== 'once') {
            const getMonthsToAdd = (recurrenceType: string) => {
              switch (recurrenceType) {
                case 'monthly': return 1;
                case 'bimonthly': return 2;
                case 'quarterly': return 3;
                case 'biannual': return 6;
                case 'annual': return 12;
                default: return 0;
              }
            };
            
            const monthsToAdd = getMonthsToAdd(payment.recurrence);
            
            const getOccurrences = (recurrenceType: string) => {
              switch (recurrenceType) {
                case 'monthly': return 12;
                case 'bimonthly': return 6;
                case 'quarterly': return 4;
                case 'biannual': return 2;
                case 'annual': return 1;
                default: return 0;
              }
            };
            
            const occurrences = getOccurrences(payment.recurrence);
            
            if (monthsToAdd > 0) {
              const dueDate = new Date(payment.due_date);
              
              for (let i = 1; i <= occurrences; i++) {
                const futureDueDate = addMonths(dueDate, monthsToAdd * i);
                
                if (isAfter(futureDueDate, currentDate)) {
                  processedPayments.push({
                    ...payment,
                    id: `${payment.id}-occurrence-${i}`,
                    due_date: futureDueDate.toISOString(),
                    status: 'pending'
                  } as Payment);
                }
              }
            }
          }
        });
      }
      
      const upcomingPayments = processedPayments
        .filter(payment => payment.status === 'pending')
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);
      
      const allPayments = processedPayments;
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);
      
      if (clientsError) throw clientsError;
      
      const clients = clientsData as Client[] || [];
      const activeClients = clients.filter(client => client.status === 'active');
      
      const currentMonthTransactions = transactions?.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= currentMonthStart && txDate <= currentMonthEnd;
      }) || [];
      
      const incomeTransactions = transactions?.filter(tx => tx.type === 'income') || [];
      const expenseTransactions = transactions?.filter(tx => tx.type === 'expense') || [];
      
      const currentMonthIncome = currentMonthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.value), 0);
      
      const currentMonthExpense = currentMonthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.value), 0);
      
      const totalIncome = incomeTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      const totalExpense = expenseTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      
      const monthlyClientIncome = activeClients
        .filter(client => 
          client.recurring_payment && 
          client.monthly_value && 
          (!client.contract_end || new Date(client.contract_end) >= currentDate)
        )
        .reduce((sum, client) => sum + (client.monthly_value || 0), 0);
      
      const yearlyTransactionsForecast = (totalIncome / 12) * 12 - (totalExpense / 12) * 12;
      const yearlyClientsIncome = monthlyClientIncome * 12;
      const yearlyForecast = yearlyTransactionsForecast + yearlyClientsIncome;
      
      const nextMonthClientsIncome = activeClients
        .filter(client => {
          return client.recurring_payment && 
                 client.monthly_value && 
                 (!client.contract_end || new Date(client.contract_end) >= nextMonthEnd);
        })
        .reduce((sum, client) => sum + (client.monthly_value || 0), 0);
      
      const nextMonthForecast = currentMonthIncome + nextMonthClientsIncome - currentMonthExpense;
      
      const taxPayable = (totalIncome + monthlyClientIncome) * 0.06;
      
      const totalBalance = totalIncome - totalExpense + monthlyClientIncome;
      
      const now = new Date(); // Defining the 'now' variable that was missing
      
      const paymentsReceived = allPayments
        ? allPayments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + Number(payment.value), 0)
        : 0;
      
      const pendingPayments = allPayments
        ? allPayments
            .filter(payment => 
              payment.status === 'pending' && 
              new Date(payment.due_date) >= now
            )
            .reduce((sum, payment) => sum + Number(payment.value), 0)
        : 0;
      
      const overduePayments = allPayments
        ? allPayments
            .filter(payment => 
              payment.status === 'pending' && 
              new Date(payment.due_date) < now
            )
            .reduce((sum, payment) => sum + Number(payment.value), 0)
        : 0;
      
      setFinancialData({
        totalBalance,
        monthlyIncome: currentMonthIncome + monthlyClientIncome,
        monthlyExpense: currentMonthExpense,
        totalSavings: totalBalance * 0.2,
        yearlyForecast,
        nextMonthForecast,
        activeClients: activeClients.length,
        taxPayable,
        upcomingPayments: upcomingPayments as Payment[] || [],
        clientsIncome: monthlyClientIncome,
        paymentsReceived,
        pendingPayments,
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
              subtitle="Saldo atual"
              icon="money"
            />
            <MetricCard
              title="Receita Mensal"
              value={formatCurrency(financialData.monthlyIncome)}
              subtitle="Entradas deste mês"
              trend="up"
              icon="income"
            />
            <MetricCard
              title="Despesa Mensal"
              value={formatCurrency(financialData.monthlyExpense)}
              subtitle="Saídas deste mês"
              trend="down"
              icon="expense"
            />
            <MetricCard
              title="Total de Economias"
              value={formatCurrency(financialData.totalSavings)}
              subtitle="Meta de economia"
              icon="savings"
            />
          </div>

          <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
            <div className="mb-4">
              <h3 className="text-lg text-gray-300 font-normal">Saldo Total vs Despesas</h3>
              <p className="text-sm text-gray-400">Comparativo entre saldo e despesas</p>
            </div>
            <BalanceVsExpensesChart 
              totalBalance={financialData.totalBalance} 
              totalExpenses={financialData.monthlyExpense}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Recebidos</h3>
                <div className="h-14 w-14 rounded-full bg-fin-green/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-fin-green" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.paymentsReceived)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Pagamentos concluídos</span>
              </div>
            </div>
            
            <div className="bg-[#1A1A1E] rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-normal">Aguardando</h3>
                <div className="h-14 w-14 rounded-full bg-[#FEC6A1]/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-[#FEC6A1]" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {formatCurrency(financialData.pendingPayments)}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400">Pagamentos pendentes</span>
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
                Base de cálculo: {formatCurrency(financialData.totalBalance)}
              </div>
            </div>

            <div className="fin-card md:col-span-2">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Próximos Pagamentos</h3>
              </div>
              <div className="mb-2 text-sm text-fin-text-secondary">
                Pagamentos programados para os próximos dias
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
                        {Number(payment.value).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-fin-text-secondary">
                  Nenhum pagamento programado para os próximos dias.
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
                <h3 className="fin-card-title">Receita por Cliente</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <CircleDollarSign size={20} />
                </div>
              </div>
              <div className="mb-2 text-sm text-fin-text-secondary">
                Visão geral de receitas por cliente
              </div>
              <div className="h-64 flex items-center justify-center text-fin-text-secondary">
                Gráfico de receitas por cliente será exibido aqui.
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Receitas vs Despesas</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="mb-2 text-sm text-fin-text-secondary">
                Comparativo mensal de receitas e despesas
              </div>
              <div className="h-64 flex items-center justify-center text-fin-text-secondary">
                Gráfico comparativo será exibido aqui.
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
                Receitas {formatCurrency(financialData.monthlyIncome * 12)} vs Despesas {formatCurrency(financialData.monthlyExpense * 12)}
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
                Receitas {formatCurrency(financialData.monthlyIncome)} vs Despesas {formatCurrency(financialData.monthlyExpense)}
              </div>
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <h3 className="fin-card-title">Clientes Ativos</h3>
                <div className="fin-icon-wrapper fin-green-icon">
                  <Users size={20} />
                </div>
              </div>
              <div className="fin-value">{financialData.activeClients}</div>
              <div className="mt-2 text-sm text-fin-text-secondary">
                Receita mensal: {formatCurrency(financialData.clientsIncome)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
