
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Relatorios = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <Button className="bg-fin-green hover:bg-fin-green/90 text-black">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileBarChart className="mr-2 h-6 w-6 text-fin-green" />
              Relatório Mensal
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Resumo das atividades financeiras do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#94949F] mb-4">
              Visualize um resumo completo das suas transações, receitas e despesas do mês atual.
            </p>
            <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-6 w-6 text-fin-green" />
              Relatório Trimestral
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Análise dos últimos 3 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#94949F] mb-4">
              Compare suas finanças nos últimos três meses e identifique tendências importantes.
            </p>
            <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileBarChart className="mr-2 h-6 w-6 text-fin-green" />
              Relatório Anual
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              Visão geral do ano financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#94949F] mb-4">
              Acompanhe seu progresso financeiro ao longo do ano e planeje o próximo.
            </p>
            <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Relatorios;
