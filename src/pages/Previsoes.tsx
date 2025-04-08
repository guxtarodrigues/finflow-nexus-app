
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, LineChart, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Previsoes = () => {
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
        
        <TabsContent value="mensal" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 h-6 w-6 text-fin-green" />
                  Previsão de Receitas
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Projeção de receitas para o próximo mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
                  <span className="text-[#94949F]">Gráfico de previsão de receitas</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <LineChart className="mr-2 h-6 w-6 text-fin-green" />
                  Previsão de Despesas
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  Projeção de gastos para o próximo mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border border-dashed border-[#2A2A2E] rounded-md">
                  <span className="text-[#94949F]">Gráfico de previsão de despesas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trimestral" className="pt-4">
          <div className="flex items-center justify-center h-64 border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Previsões trimestrais estarão disponíveis em breve</span>
          </div>
        </TabsContent>
        
        <TabsContent value="anual" className="pt-4">
          <div className="flex items-center justify-center h-64 border border-dashed border-[#2A2A2E] rounded-md">
            <span className="text-[#94949F]">Previsões anuais estarão disponíveis em breve</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Previsoes;
