
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Metas = () => {
  const metas = [
    {
      id: 1,
      title: "Fundo de Emergência",
      description: "Guardar 6 meses de despesas",
      target: 20000,
      current: 8000,
      deadline: "Dezembro 2023",
    },
    {
      id: 2,
      title: "Viagem",
      description: "Economizar para viagem de férias",
      target: 10000,
      current: 7500,
      deadline: "Julho 2023",
    },
    {
      id: 3,
      title: "Novo Equipamento",
      description: "Comprar novo laptop para trabalho",
      target: 8000,
      current: 3200,
      deadline: "Setembro 2023",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
        <Button className="bg-fin-green hover:bg-fin-green/90 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metas.map((meta) => (
          <Card key={meta.id} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="mr-2 h-6 w-6 text-fin-green" />
                {meta.title}
              </CardTitle>
              <CardDescription className="text-[#94949F]">
                {meta.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Meta: R$ {meta.target.toLocaleString('pt-BR')}</span>
                  <span>Prazo: {meta.deadline}</span>
                </div>
                <Progress value={(meta.current / meta.target) * 100} className="h-2 bg-[#2A2A2E]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    R$ {meta.current.toLocaleString('pt-BR')} de R$ {meta.target.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-fin-green font-medium">
                    {Math.round((meta.current / meta.target) * 100)}%
                  </span>
                </div>
                <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Atualizar Progresso
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-[#1F1F23] border-[#2A2A2E] border-dashed text-white shadow flex flex-col items-center justify-center p-6 h-[245px]">
          <Plus className="h-12 w-12 text-[#2A2A2E] mb-2" />
          <p className="text-[#94949F] mb-4 text-center">Adicione uma nova meta financeira</p>
          <Button variant="outline" className="border-fin-green text-fin-green hover:bg-fin-green/10">
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Metas;
