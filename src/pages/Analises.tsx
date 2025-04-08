
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from 'lucide-react';

const Analises = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Análises Financeiras</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart className="mr-2 h-6 w-6 text-fin-green" />
              Análise de Gastos
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Visualize seus maiores gastos por categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
              <span className="text-[#94949F]">Gráfico de gastos por categoria</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <LineChart className="mr-2 h-6 w-6 text-fin-green" />
              Tendências
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Acompanhe a evolução de suas finanças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
              <span className="text-[#94949F]">Gráfico de tendências financeiras</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="mr-2 h-6 w-6 text-fin-green" />
              Distribuição de Receitas
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Entenda a origem dos seus rendimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
              <span className="text-[#94949F]">Gráfico de distribuição de receitas</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analises;
