
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CircleDollarSign, TrendingUp, FileText } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();

  const handleNewTransaction = () => {
    toast({
      title: "Nova transação",
      description: "Funcionalidade a ser implementada.",
    });
  };

  const handleManagePayments = () => {
    toast({
      title: "Gerenciar pagamentos",
      description: "Funcionalidade a ser implementada.",
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
          value="R$ 0,00"
          subtitle="Saldo atual"
          icon="money"
        />
        <MetricCard
          title="Receita Mensal"
          value="R$ 0,00"
          subtitle="Entradas deste mês"
          trend="up"
          icon="income"
        />
        <MetricCard
          title="Despesa Mensal"
          value="R$ 0,00"
          subtitle="Saídas deste mês"
          trend="down"
          icon="expense"
        />
        <MetricCard
          title="Total de Economias"
          value="R$ 0,00"
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
          <div className="fin-value">R$ 0,00</div>
          <div className="mt-2 text-sm text-fin-text-secondary">
            Receitas R$ 0,00 vs Despesas R$ 0,00
          </div>
        </div>

        <div className="fin-card">
          <div className="fin-card-header">
            <h3 className="fin-card-title">Previsão Próximo Mês</h3>
            <div className="fin-icon-wrapper fin-green-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="fin-value">R$ 0,00</div>
          <div className="mt-2 text-sm text-fin-text-secondary">
            Receitas R$ 0,00 vs Despesas R$ 0,00
          </div>
        </div>

        <div className="fin-card">
          <div className="fin-card-header">
            <h3 className="fin-card-title">Clientes Ativos</h3>
            <div className="fin-icon-wrapper fin-green-icon">
              <CircleDollarSign size={20} />
            </div>
          </div>
          <div className="fin-value">0</div>
          <div className="mt-2">
            <Button variant="ghost" className="text-fin-green p-0 h-auto">
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
          <div className="fin-value">R$ 0,00</div>
          <div className="mt-2 text-sm text-fin-text-secondary">
            Base de cálculo: R$ 0,00
          </div>
        </div>

        <div className="fin-card md:col-span-2">
          <div className="fin-card-header">
            <h3 className="fin-card-title">Próximos Pagamentos</h3>
          </div>
          <div className="mb-2 text-sm text-fin-text-secondary">
            Pagamentos programados para os próximos dias
          </div>
          <div className="h-32 flex items-center justify-center text-fin-text-secondary">
            Nenhum pagamento programado para os próximos dias.
          </div>
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
