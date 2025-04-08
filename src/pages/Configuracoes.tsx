
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, Bell, Lock, Database, Globe, Smartphone, PanelLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <Button className="bg-fin-green hover:bg-fin-green/90 text-black">
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <div className="flex">
          <div className="w-64 border-r border-[#2A2A2E] pr-4">
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 w-full justify-start items-start">
              <TabsTrigger 
                value="perfil" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger 
                value="metodos" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Métodos de Pagamento
              </TabsTrigger>
              <TabsTrigger 
                value="notificacoes" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger 
                value="seguranca" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <Lock className="mr-2 h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger 
                value="dados" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <Database className="mr-2 h-4 w-4" />
                Dados e Privacidade
              </TabsTrigger>
              <TabsTrigger 
                value="aparencia" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <PanelLeft className="mr-2 h-4 w-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger 
                value="apps" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Aplicativos Conectados
              </TabsTrigger>
              <TabsTrigger 
                value="idioma" 
                className="justify-start w-full px-3 py-2 data-[state=active]:bg-[#1F1F23] data-[state=active]:text-fin-green"
              >
                <Globe className="mr-2 h-4 w-4" />
                Idioma e Região
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 pl-6">
            <TabsContent value="perfil" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie suas informações pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[#94949F]">Nome</label>
                      <Input className="bg-[#2A2A2E] border-[#3A3A3E]" defaultValue="João Silva" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#94949F]">Sobrenome</label>
                      <Input className="bg-[#2A2A2E] border-[#3A3A3E]" defaultValue="Pereira" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#94949F]">Email</label>
                      <Input className="bg-[#2A2A2E] border-[#3A3A3E]" defaultValue="joao.silva@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[#94949F]">Telefone</label>
                      <Input className="bg-[#2A2A2E] border-[#3A3A3E]" defaultValue="(11) 98765-4321" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notificacoes" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Preferências de Notificação</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Controle quais notificações você deseja receber
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Alertas Financeiros</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Alertas de pagamentos</p>
                          <p className="text-xs text-[#94949F]">Receba notificações sobre faturas próximas do vencimento</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-[#2A2A2E]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Alertas de saldo baixo</p>
                          <p className="text-xs text-[#94949F]">Seja notificado quando seu saldo estiver abaixo do limite</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator className="bg-[#2A2A2E]" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Relatórios semanais</p>
                          <p className="text-xs text-[#94949F]">Receba um resumo semanal das suas finanças</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metodos" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie seus cartões e contas bancárias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Métodos de pagamento serão exibidos aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seguranca" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie a segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Configurações de segurança serão exibidas aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dados" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Dados e Privacidade</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie seus dados e preferências de privacidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Configurações de privacidade serão exibidas aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="aparencia" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Personalize a aparência do aplicativo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Configurações de aparência serão exibidas aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="apps" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Aplicativos Conectados</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie aplicativos conectados à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Aplicativos conectados serão exibidos aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="idioma" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Idioma e Região</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Configure o idioma e preferências regionais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 border border-dashed border-[#2A2A2E] rounded-md">
                    <span className="text-[#94949F]">Configurações de idioma serão exibidas aqui</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
