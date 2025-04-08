
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CircleDollarSign, TrendingUp, FileText, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, format } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalSavings: 0,
    yearlyForecast: 0,
    nextMonthForecast: 0,
    activeClients: 0,
    taxPayable: 0,
    upcomingPayments: []
  });

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Get the current month dates
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      
      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);
      
      if (transactionsError) throw transactionsError;
      
      // Fetch upcoming payments
      const { data: upcomingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (paymentsError) throw paymentsError;
      
      // Calculate financial metrics
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
      
      // Calculate tax (6% of income)
      const taxPayable = totalIncome * 0.06;
      
      setFinancialData({
        totalBalance: totalIncome - totalExpense,
        monthlyIncome: currentMonthIncome,
        monthlyExpense: currentMonthExpense,
        totalSavings: (totalIncome - totalExpense) * 0.2, // Assuming 20% of net income is saved
        yearlyForecast: totalIncome * 12 - totalExpense * 12, // Simple forecast based on current data
        nextMonthForecast: currentMonthIncome - currentMonthExpense, // Simple forecast for next month
        activeClients: new Set(incomeTransactions.map(tx => tx.category)).size, // Unique categories as "clients"
        taxPayable,
        upcomingPayments: upcomingPayments || []
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
              <CircleDollarSign size={20} />
            </div>
          </div>
          <div className="fin-value">{financialData.activeClients}</div>
          <div className="mt-2">
            <Button 
              variant="ghost" 
              className="text-fin-green p-0 h-auto"
              onClick={handleNewTransaction}
            >
              + Novos clientes
            </Button>
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
            <h3 className="fin-card-title">Despesas por Categoria</h3>
          </div>
          <div className="mb-2 text-sm text-fin-text-secondary">
            Visão geral das despesas por categoria
          </div>
          <div className="h-64 flex items-center justify-center text-fin-text-secondary">
            Gráfico de despesas por categoria será exibido aqui.
          </div>
        </div>

        <div className="fin-card">
          <div className="fin-card-header">
            <h3 className="fin-card-title">Receitas vs Despesas</h3>
          </div>
          <div className="mb-2 text-sm text-fin-text-secondary">
            Comparativo mensal de receitas e despesas
          </div>
          <div className="h-64 flex items-center justify-center text-fin-text-secondary">
            Gráfico comparativo será exibido aqui.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
