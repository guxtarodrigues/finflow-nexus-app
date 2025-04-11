
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  CircleDollarSign, 
  Users, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { CategoryExpensesChart } from '@/components/analytics/CategoryExpensesChart';
import { IncomeExpenseTrendsChart } from '@/components/analytics/IncomeExpenseTrendsChart';
import { IncomeSourcesChart } from '@/components/analytics/IncomeSourcesChart';
import { ClientMetricsChart } from '@/components/analytics/ClientMetricsChart';
import { PaymentStatusChart } from '@/components/analytics/PaymentStatusChart';
import { MonthlyComparison } from '@/components/analytics/MonthlyComparison';

const Analises = () => {
  const [activeTab, setActiveTab] = useState("financeiro");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Análises</h1>
      </div>

      <Tabs 
        defaultValue="financeiro" 
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="financeiro" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Análise</span> Financeira
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Análise de</span> Tendências
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Análise de</span> Clientes
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center">
            <CircleDollarSign className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Análise de</span> Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryExpensesChart />
            <IncomeSourcesChart />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <MonthlyComparison />
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Análise de Tendências
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Visualize tendências e evolução de suas finanças ao longo do tempo
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 gap-4">
            <IncomeExpenseTrendsChart />
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Análise de Clientes
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Métricas e insights sobre sua carteira de clientes
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 gap-4">
            <ClientMetricsChart />
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4">
          <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Análise de Pagamentos
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                Visualize o status de recebimentos e pagamentos
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 gap-4">
            <PaymentStatusChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analises;
