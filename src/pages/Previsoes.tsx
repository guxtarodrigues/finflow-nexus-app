
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, LineChart, Calendar, CircleDollarSign, CreditCard, Users, Wallet, Landmark, Lightbulb, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, addMonths, startOfMonth, endOfMonth, subMonths, getMonth } from 'date-fns';
import { 
  calculateLinearRegression, 
  predictNextValues, 
  formatMonthlyForecastData, 
  calculateGrowthRate,
  calculateSeasonalForecast
} from '@/utils/forecasting';
import { ForecastChart } from '@/components/forecasting/ForecastChart';
import { ForecastSummary } from '@/components/forecasting/ForecastSummary';
import { ForecastMetricCard } from '@/components/forecasting/ForecastMetricCard';
import { Separator } from '@/components/ui/separator';

const Previsoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{
    income: number[];
    expense: number[];
    clients: number[];
    months: string[];
  }>({ income: [], expense: [], clients: [], months: [] });
  
  const [forecastData, setForecastData] = useState<{
    income: number[];
    expense: number[];
    clients: number[];
    bestMonth: string;
    seasonalFactors: { [key: string]: number };
  }>({ 
    income: [], expense: [], clients: [], 
    bestMonth: '', 
    seasonalFactors: {}
  });
  
  const [revenueByCategory, setRevenueByCategory] = useState<{
    categories: string[];
    historical: number[][];
    forecast: number[][];
  }>({ categories: [], historical: [], forecast: [] });
  
  const [clientsData, setClientsData] = useState<{
    total: number;
    active: number;
    inactive: number;
    projected: number;
  }>({ total: 0, active: 0, inactive: 0, projected: 0 });

  // Fetch historical data for forecasting
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get data for last 12 months
        const months = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const month = subMonths(now, i);
          const startDate = startOfMonth(month);
          const endDate = endOfMonth(month);
          
          months.push({
            label: format(month, 'MMM/yyyy'),
            startDate,
            endDate,
            monthKey: format(month, 'yyyy-MM')
          });
        }
        
        // Fetch all transactions within the last 12 months
        const start = months[0].startDate.toISOString();
        const end = months[months.length - 1].endDate.toISOString();
        
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('type, value, date, category')
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end);
        
        if (error) throw error;
        
        // Fetch clients
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('id, created_at, status')
          .eq('user_id', user.id);
        
        if (clientsError) throw clientsError;
        
        // Process monthly income and expenses
        const monthlyIncome = [];
        const monthlyExpense = [];
        const monthlyClients = [];
        const monthlyLabels = [];
        
        // Process revenues by category
        const categoriesMap = new Map<string, number[]>();
        
        for (const month of months) {
          // Filter transactions for this month
          const monthTransactions = transactions?.filter(t => {
            const date = new Date(t.date);
            return date >= month.startDate && date <= month.endDate;
          }) || [];
          
          // Calculate total income and expenses for the month
          const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.value || 0), 0);
            
          const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.value || 0), 0);
          
          // Process category data
          const monthCategories = new Map<string, number>();
          monthTransactions
            .filter(t => t.type === 'income')
            .forEach(t => {
              const category = t.category || 'Outros';
              const current = monthCategories.get(category) || 0;
              monthCategories.set(category, current + t.value);
              
              // Initialize category array if needed
              if (!categoriesMap.has(category)) {
                categoriesMap.set(category, Array(months.length).fill(0));
              }
            });
          
          // Update categories map
          categoriesMap.forEach((values, category) => {
            const monthIndex = months.indexOf(month);
            values[monthIndex] = monthCategories.get(category) || 0;
          });
          
          // Count new clients in this month
          const newClients = clients?.filter(c => {
            const createdAt = new Date(c.created_at);
            return createdAt >= month.startDate && createdAt <= month.endDate;
          }).length || 0;
          
          monthlyIncome.push(income);
          monthlyExpense.push(expense);
          monthlyClients.push(newClients);
          monthlyLabels.push(month.label);
        }
        
        // Set monthly data state
        setMonthlyData({
          income: monthlyIncome,
          expense: monthlyExpense,
          clients: monthlyClients,
          months: monthlyLabels
        });
        
        // Set revenue by category data
        const topCategories = Array.from(categoriesMap.entries())
          .sort((a, b) => {
            const sumA = a[1].reduce((sum, v) => sum + v, 0);
            const sumB = b[1].reduce((sum, v) => sum + v, 0);
            return sumB - sumA;
          })
          .slice(0, 5);
        
        setRevenueByCategory({
          categories: topCategories.map(([category]) => category),
          historical: topCategories.map(([_, values]) => values),
          forecast: topCategories.map(([_, values]) => {
            const regression = calculateLinearRegression(values);
            return predictNextValues(values, 3, regression);
          })
        });
        
        // Set clients data
        setClientsData({
          total: clients?.length || 0,
          active: clients?.filter(c => c.status === 'active').length || 0,
          inactive: clients?.filter(c => c.status === 'inactive').length || 0,
          projected: 0 // Will be calculated in forecasting
        });
        
        // Generate forecasts
        generateForecasts(monthlyIncome, monthlyExpense, monthlyClients, monthlyLabels, clients?.length || 0);
        
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [user]);
  
  // Generate forecasts based on historical data
  const generateForecasts = (
    incomeData: number[], 
    expenseData: number[], 
    clientsData: number[],
    monthLabels: string[],
    totalClients: number
  ) => {
    // Calculate linear regression for income
    const incomeRegression = calculateLinearRegression(incomeData);
    const incomeForecast = predictNextValues(incomeData, 6, incomeRegression);
    
    // Calculate linear regression for expenses
    const expenseRegression = calculateLinearRegression(expenseData);
    const expenseForecast = predictNextValues(expenseData, 6, expenseRegression);
    
    // Calculate linear regression for clients
    const clientsRegression = calculateLinearRegression(clientsData);
    const clientsForecast = predictNextValues(clientsData, 6, clientsRegression);
    
    // Calculate seasonal factors based on month
    const seasonalFactors: { [key: string]: number[] } = {};
    
    // Group values by month for seasonal analysis
    incomeData.forEach((value, index) => {
      const date = new Date(monthLabels[index]);
      const month = getMonth(date);
      if (!seasonalFactors[month]) {
        seasonalFactors[month] = [];
      }
      seasonalFactors[month].push(value);
    });
    
    // Calculate average for each month
    const seasonalAverages = calculateSeasonalForecast(seasonalFactors);
    
    // Find best month for revenue
    let bestMonth = 0;
    let bestMonthValue = 0;
    
    Object.entries(seasonalAverages).forEach(([month, value]) => {
      if (value > bestMonthValue) {
        bestMonthValue = value;
        bestMonth = parseInt(month);
      }
    });
    
    // Update client projections
    const projectedClients = Math.round(
      totalClients + clientsForecast.reduce((sum, v) => sum + v, 0)
    );
    
    setClientsData(prev => ({
      ...prev,
      projected: projectedClients
    }));
    
    // Set forecast data
    setForecastData({
      income: incomeForecast,
      expense: expenseForecast,
      clients: clientsForecast,
      bestMonth: format(new Date(0, bestMonth), 'MMMM'),
      seasonalFactors: seasonalAverages
    });
  };
  
  // Format data for revenue forecast chart
  const revenueChartData = () => {
    const currentDate = new Date();
    
    // Format historical data
    const data = formatMonthlyForecastData(
      monthlyData.income, 
      forecastData.income,
      currentDate
    );
    
    return data.map(item => ({
      month: item.month,
      value: item.type === 'historical' ? item.value : null,
      forecast: item.type === 'forecast' ? item.value : null
    }));
  };
  
  // Format data for expense forecast chart
  const expenseChartData = () => {
    const currentDate = new Date();
    
    // Format historical data
    const data = formatMonthlyForecastData(
      monthlyData.expense, 
      forecastData.expense,
      currentDate
    );
    
    return data.map(item => ({
      month: item.month,
      value: item.type === 'historical' ? item.value : null,
      forecast: item.type === 'forecast' ? item.value : null
    }));
  };
  
  // Format data for clients forecast chart
  const clientsChartData = () => {
    const currentDate = new Date();
    
    // Format historical data
    const data = formatMonthlyForecastData(
      monthlyData.clients, 
      forecastData.clients,
      currentDate
    );
    
    return data.map(item => ({
      month: item.month,
      value: item.type === 'historical' ? item.value : null,
      forecast: item.type === 'forecast' ? item.value : null
    }));
  };
  
  // Calculate growth trends for forecast summary
  const calculateTrends = () => {
    if (monthlyData.income.length < 2 || forecastData.income.length === 0) {
      return { revenue: 0, expense: 0, clients: 0 };
    }
    
    const lastMonthIncome = monthlyData.income[monthlyData.income.length - 1];
    const nextMonthIncome = forecastData.income[0];
    const revenueTrend = calculateGrowthRate(nextMonthIncome, lastMonthIncome);
    
    const lastMonthExpense = monthlyData.expense[monthlyData.expense.length - 1];
    const nextMonthExpense = forecastData.expense[0];
    const expenseTrend = calculateGrowthRate(nextMonthExpense, lastMonthExpense);
    
    const lastMonthClients = monthlyData.clients[monthlyData.clients.length - 1];
    const nextMonthClients = forecastData.clients[0];
    const clientsTrend = calculateGrowthRate(nextMonthClients, lastMonthClients);
    
    return { revenue: revenueTrend, expense: expenseTrend, clients: clientsTrend };
  };
  
  const trends = calculateTrends();

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Previsões Financeiras</h1>
      </div>

      <Tabs defaultValue="mensal" className="w-full">
        <TabsList className="bg-[#1F1F23] border-b border-[#2A2A2E] w-full justify-start rounded-none p-0">
          <TabsTrigger 
            value="mensal" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-fin-green data-[state=active]:text-fin-green py-2 px-4"
          >
            Mensal
          </TabsTrigger>
          <TabsTrigger 
            value="trimestral" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-fin-green data-[state=active]:text-fin-green py-2 px-4"
          >
            Trimestral
          </TabsTrigger>
          <TabsTrigger 
            value="anual" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-fin-green data-[state=active]:text-fin-green py-2 px-4"
          >
            Anual
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mensal" className="pt-4 space-y-6">
          {/* Forecast Summary Card */}
          <ForecastSummary 
            nextMonthRevenue={forecastData.income[0] || 0}
            nextMonthExpenses={forecastData.expense[0] || 0}
            nextMonthBalance={(forecastData.income[0] || 0) - (forecastData.expense[0] || 0)}
            revenueTrend={trends.revenue}
            expenseTrend={trends.expense}
            projectedClients={forecastData.clients[0] || 0}
            clientsTrend={trends.clients}
            bestMonth={forecastData.bestMonth}
          />
          
          {/* Income and Expense Forecast Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForecastChart 
              title="Previsão de Receitas"
              description="Projeção de receitas para os próximos meses"
              icon={<CircleDollarSign className="mr-2 h-6 w-6 text-fin-green" />}
              data={revenueChartData()}
              loading={loading}
              formatValue={(value) => formatCurrency(value)}
            />
            
            <ForecastChart 
              title="Previsão de Despesas"
              description="Projeção de despesas para os próximos meses"
              icon={<CreditCard className="mr-2 h-6 w-6 text-fin-red" />}
              data={expenseChartData()}
              loading={loading}
              formatValue={(value) => formatCurrency(value)}
            />
          </div>
          
          {/* Client and Revenue by Category Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ForecastChart 
              title="Previsão de Novos Clientes"
              description="Projeção de aquisição de clientes para os próximos meses"
              icon={<Users className="mr-2 h-6 w-6 text-[#3b82f6]" />}
              data={clientsChartData()}
              loading={loading}
              formatValue={(value) => value.toFixed(0)}
            />
            
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="mr-2 h-6 w-6 text-[#8b5cf6]" />
                  Previsão por Categoria
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Projeção de receitas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <span className="text-[#94949F]">Carregando previsões...</span>
                  </div>
                ) : revenueByCategory.categories.length === 0 ? (
                  <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Sem dados para categorias</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueByCategory.categories.map((category, index) => {
                      const historicalSum = revenueByCategory.historical[index].reduce((sum, v) => sum + v, 0);
                      const forecastSum = revenueByCategory.forecast[index].reduce((sum, v) => sum + v, 0);
                      const growthRate = calculateGrowthRate(forecastSum, historicalSum);
                      
                      return (
                        <div key={category} className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-3" style={{ 
                            backgroundColor: [
                              '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6'
                            ][index % 5] 
                          }}></div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{category}</span>
                              <span>{formatCurrency(forecastSum)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-[#94949F]">
                              <span>Próximos 3 meses</span>
                              <span className={growthRate >= 0 ? 'text-fin-green' : 'text-fin-red'}>
                                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Business Insights */}
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-[#f59e0b]" />
                Insights de Negócio
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Recomendações baseadas nas previsões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cash Flow Prediction */}
                <div className="p-4 bg-[#252529] rounded-lg">
                  <div className="flex items-center mb-2">
                    <Landmark className="h-5 w-5 text-[#3b82f6] mr-2" />
                    <h3 className="font-medium">Previsão de Fluxo de Caixa</h3>
                  </div>
                  
                  <p className="text-sm text-[#94949F] mb-3">
                    Com base nas suas tendências, projetamos seu fluxo de caixa para os próximos 3 meses:
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[0, 1, 2].map((i) => {
                      const month = format(addMonths(new Date(), i + 1), 'MMM/yyyy');
                      const income = forecastData.income[i] || 0;
                      const expense = forecastData.expense[i] || 0;
                      const balance = income - expense;
                      const status = balance >= 0 ? 'positive' : 'negative';
                      
                      return (
                        <div key={i} className={`p-3 rounded-lg ${
                          status === 'positive' ? 'bg-fin-green/10 border border-fin-green/20' : 
                          'bg-fin-red/10 border border-fin-red/20'
                        }`}>
                          <div className="text-xs text-[#94949F] mb-1">{month}</div>
                          <div className={`text-sm font-medium ${
                            status === 'positive' ? 'text-fin-green' : 'text-fin-red'
                          }`}>
                            {formatCurrency(balance)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Recommendations */}
                  <div className="text-sm text-[#94949F]">
                    <strong className="text-white">Recomendação:</strong>{' '}
                    {trends.revenue > trends.expense ? (
                      "Suas receitas estão crescendo mais rápido que as despesas. Continue com a estratégia atual."
                    ) : (
                      "Suas despesas estão crescendo mais rápido que as receitas. Considere revisar custos ou aumentar fontes de receita."
                    )}
                  </div>
                </div>
                
                {/* Risk Alerts */}
                {trends.revenue < 0 && (
                  <div className="p-4 bg-fin-red/10 border border-fin-red/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-fin-red mr-2" />
                      <h3 className="font-medium text-fin-red">Alerta de Risco</h3>
                    </div>
                    
                    <p className="text-sm text-[#94949F]">
                      Detectamos uma tendência de queda nas receitas de {Math.abs(trends.revenue).toFixed(1)}%. 
                      Recomendamos revisar sua estratégia de vendas e considerar novas fontes de receita.
                    </p>
                  </div>
                )}
                
                {/* Opportunity Insights */}
                <div className="p-4 bg-[#252529] rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-fin-green mr-2" />
                    <h3 className="font-medium">Oportunidades</h3>
                  </div>
                  
                  <p className="text-sm text-[#94949F] mb-3">
                    Com base na análise sazonal, identificamos os melhores períodos para focar em crescimento:
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="block w-2 h-2 rounded-full bg-fin-green mt-1.5 mr-2"></span>
                      <span>
                        Melhor período para receitas: <span className="text-white">{forecastData.bestMonth}</span> 
                        {' '}(historicamente seu melhor mês)
                      </span>
                    </li>
                    
                    {revenueByCategory.categories.length > 0 && (
                      <li className="flex items-start">
                        <span className="block w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 mr-2"></span>
                        <span>
                          Categoria com maior potencial: <span className="text-white">{revenueByCategory.categories[0]}</span> 
                          {' '}(projeção de crescimento de {
                            calculateGrowthRate(
                              revenueByCategory.forecast[0].reduce((sum, v) => sum + v, 0),
                              revenueByCategory.historical[0].reduce((sum, v) => sum + v, 0)
                            ).toFixed(1)
                          }%)
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trimestral" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4].map((quarter) => {
              const startMonth = (quarter - 1) * 3;
              const isCurrentOrFuture = startMonth >= getMonth(new Date());
              const isProjected = startMonth > getMonth(new Date());
              
              // Calculate quarter data
              const incomeSum = isProjected 
                ? forecastData.income.slice(0, 3).reduce((sum, v) => sum + v, 0) 
                : monthlyData.income.slice(startMonth, startMonth + 3).reduce((sum, v) => sum + v, 0);
                
              const expenseSum = isProjected
                ? forecastData.expense.slice(0, 3).reduce((sum, v) => sum + v, 0)
                : monthlyData.expense.slice(startMonth, startMonth + 3).reduce((sum, v) => sum + v, 0);
              
              return (
                <Card 
                  key={quarter}
                  className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow ${
                    isCurrentOrFuture ? 'ring-1 ring-fin-green/30' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {isProjected ? 'Projeção T' : 'T'}{quarter}/2024
                      </CardTitle>
                      {isProjected && (
                        <span className="text-xs px-2 py-1 bg-fin-green/10 text-fin-green rounded-full">
                          Projeção
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-[#94949F]">
                      {isProjected 
                        ? 'Valores projetados para o trimestre'
                        : 'Desempenho do trimestre'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2E]">
                        <div className="text-[#94949F]">Receitas</div>
                        <div className="font-medium">{formatCurrency(incomeSum)}</div>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2E]">
                        <div className="text-[#94949F]">Despesas</div>
                        <div className="font-medium">{formatCurrency(expenseSum)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[#94949F]">Balanço</div>
                        <div className={`font-medium ${
                          incomeSum - expenseSum >= 0 ? 'text-fin-green' : 'text-fin-red'
                        }`}>
                          {formatCurrency(incomeSum - expenseSum)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-fin-green" />
                Comparativo Trimestral
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Análise comparativa entre trimestres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
                <span className="text-[#94949F]">Gráfico de comparativo trimestral será disponibilizado em breve</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-[#f59e0b]" />
                Tendências Trimestrais
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Análise de padrões e ciclos trimestrais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-[#94949F]">
                <p>
                  Análises trimestrais permitem identificar ciclos de negócio mais amplos e 
                  planejar estratégias de médio prazo. Com base nos dados históricos e projeções:
                </p>
                
                <ul className="space-y-3 mt-3">
                  <li className="flex items-start">
                    <span className="block w-2 h-2 rounded-full bg-fin-green mt-1.5 mr-2"></span>
                    <span>
                      O próximo trimestre tem projeção de {
                        trends.revenue >= 0 ? 'crescimento' : 'queda'
                      } de receitas em comparação ao anterior.
                    </span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="block w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 mr-2"></span>
                    <span>
                      Recomendamos focar em estratégias de {
                        trends.revenue >= trends.expense ? 'crescimento' : 'otimização de custos'
                      } para o próximo trimestre.
                    </span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="block w-2 h-2 rounded-full bg-[#f59e0b] mt-1.5 mr-2"></span>
                    <span>
                      A sazonalidade indica que o {
                        Math.floor(parseInt(forecastData.bestMonth) / 3) + 1
                      }º trimestre tende a ter melhor desempenho baseado em dados históricos.
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="anual" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow row-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-6 w-6 text-fin-green" />
                  Projeção Anual 2024
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Visão geral das projeções para o ano inteiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-center">
                    <div className="w-2/5 text-[#94949F]">Receitas Totais (Projeção)</div>
                    <div className="w-3/5">
                      <div className="font-medium mb-1">
                        {formatCurrency(
                          [...monthlyData.income, ...forecastData.income].reduce((sum, v) => sum + v, 0)
                        )}
                      </div>
                      <div className="w-full bg-[#2A2A2E] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-fin-green h-full rounded-full" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-2/5 text-[#94949F]">Despesas Totais (Projeção)</div>
                    <div className="w-3/5">
                      <div className="font-medium mb-1">
                        {formatCurrency(
                          [...monthlyData.expense, ...forecastData.expense].reduce((sum, v) => sum + v, 0)
                        )}
                      </div>
                      <div className="w-full bg-[#2A2A2E] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-fin-red h-full rounded-full" 
                          style={{ width: '40%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-2/5 text-[#94949F]">Lucro Anual (Projeção)</div>
                    <div className="w-3/5">
                      <div className="font-medium mb-1">
                        {formatCurrency(
                          [...monthlyData.income, ...forecastData.income].reduce((sum, v) => sum + v, 0) -
                          [...monthlyData.expense, ...forecastData.expense].reduce((sum, v) => sum + v, 0)
                        )}
                      </div>
                      <div className="w-full bg-[#2A2A2E] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#8b5cf6] h-full rounded-full" 
                          style={{ width: '25%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-2/5 text-[#94949F]">Novos Clientes (Projeção)</div>
                    <div className="w-3/5">
                      <div className="font-medium mb-1">
                        {(
                          monthlyData.clients.reduce((sum, v) => sum + v, 0) +
                          forecastData.clients.reduce((sum, v) => sum + v, 0)
                        ).toFixed(0)}
                      </div>
                      <div className="w-full bg-[#2A2A2E] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#3b82f6] h-full rounded-full" 
                          style={{ width: '80%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-[#2A2A2E] my-4" />
                  
                  <div className="text-sm text-[#94949F]">
                    <p className="mb-3">Previsão de crescimento anual:</p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[#252529] rounded-lg">
                        <div className="text-xs mb-1">Receitas</div>
                        <div className={`text-base font-medium ${trends.revenue >= 0 ? 'text-fin-green' : 'text-fin-red'}`}>
                          {trends.revenue >= 0 ? '+' : ''}{(trends.revenue * 12 / 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="p-3 bg-[#252529] rounded-lg">
                        <div className="text-xs mb-1">Despesas</div>
                        <div className={`text-base font-medium ${trends.expense <= 0 ? 'text-fin-green' : 'text-fin-red'}`}>
                          {trends.expense >= 0 ? '+' : ''}{(trends.expense * 12 / 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="p-3 bg-[#252529] rounded-lg">
                        <div className="text-xs mb-1">Clientes</div>
                        <div className={`text-base font-medium ${trends.clients >= 0 ? 'text-fin-green' : 'text-fin-red'}`}>
                          {trends.clients >= 0 ? '+' : ''}{(trends.clients * 12 / 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <LineChart className="mr-2 h-6 w-6 text-fin-green" />
                  Comparativo Anual
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Comparação com metas e anos anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
                  <span className="text-[#94949F]">Gráfico de comparativo anual será disponibilizado em breve</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="mr-2 h-6 w-6 text-[#f59e0b]" />
                  Planejamento Anual
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Recomendações para o planejamento do ano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-[#94949F]">
                  <p>
                    Com base nas projeções anuais, recomendamos as seguintes estratégias:
                  </p>
                  
                  <ul className="space-y-3 mt-3">
                    <li className="flex items-start">
                      <span className="block w-2 h-2 rounded-full bg-fin-green mt-1.5 mr-2"></span>
                      <span>
                        {trends.revenue >= 2.0 
                          ? 'Ampliar investimentos em marketing e expansão de serviços para capitalizar o crescimento projetado.'
                          : 'Focar em retenção de clientes e otimização dos serviços existentes para estabilizar receitas.'}
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="block w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 mr-2"></span>
                      <span>
                        {trends.expense >= trends.revenue 
                          ? 'Implementar medidas de redução de custos e melhoria de eficiência operacional.'
                          : 'Manter controle de despesas enquanto amplia capacidade operacional.'}
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="block w-2 h-2 rounded-full bg-[#f59e0b] mt-1.5 mr-2"></span>
                      <span>
                        Planejar investimentos principais para o período de {forecastData.bestMonth}, 
                        aproveitando a sazonalidade favorável.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Previsoes;
