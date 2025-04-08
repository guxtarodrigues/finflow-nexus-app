
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus, Settings, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const Alertas = () => {
  const alertas = [
    {
      id: 1,
      title: "Fatura do Cartão",
      description: "Alerta 3 dias antes do vencimento da fatura",
      type: "reminder",
      active: true,
    },
    {
      id: 2,
      title: "Limite de Gastos",
      description: "Alerta quando os gastos mensais ultrapassarem R$ 5.000",
      type: "warning",
      active: true,
    },
    {
      id: 3,
      title: "Pagamentos Recorrentes",
      description: "Alerta sobre pagamentos recorrentes próximos",
      type: "info",
      active: false,
    },
    {
      id: 4,
      title: "Saldo Baixo",
      description: "Alerta quando o saldo da conta estiver abaixo de R$ 1.000",
      type: "danger",
      active: true,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Alertas Financeiros</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#2A2A2E] text-white hover:bg-[#2A2A2E]">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button className="bg-fin-green hover:bg-fin-green/90 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Novo Alerta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertas.map((alerta) => (
          <Card key={alerta.id} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  {alerta.type === "reminder" && <Bell className="mr-2 h-5 w-5 text-fin-green" />}
                  {alerta.type === "warning" && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
                  {alerta.type === "info" && <Info className="mr-2 h-5 w-5 text-blue-500" />}
                  {alerta.type === "danger" && <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />}
                  {alerta.title}
                </CardTitle>
                <CardDescription className="text-[#94949F]">
                  {alerta.description}
                </CardDescription>
              </div>
              <Switch checked={alerta.active} />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {alerta.type === "reminder" && (
                    <Badge variant="outline" className="bg-fin-green/10 text-fin-green border-fin-green">Lembrete</Badge>
                  )}
                  {alerta.type === "warning" && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Atenção</Badge>
                  )}
                  {alerta.type === "info" && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">Informativo</Badge>
                  )}
                  {alerta.type === "danger" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">Crítico</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-[#94949F] hover:text-white hover:bg-[#2A2A2E]">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-[#1F1F23] border-[#2A2A2E] border-dashed text-white shadow flex flex-col items-center justify-center p-6 h-[170px]">
          <Plus className="h-12 w-12 text-[#2A2A2E] mb-2" />
          <p className="text-[#94949F] mb-4 text-center">Adicione um novo alerta financeiro</p>
          <Button variant="outline" className="border-fin-green text-fin-green hover:bg-fin-green/10">
            <Plus className="mr-2 h-4 w-4" />
            Novo Alerta
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Alertas;
