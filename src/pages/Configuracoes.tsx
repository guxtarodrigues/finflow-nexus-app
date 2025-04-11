import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, Bell, Lock, Database, Globe, Smartphone, PanelLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { StripeIntegration } from '@/components/payments/StripeIntegration';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  
  const [language, setLanguage] = useState('pt-BR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('BRL');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profileData?.settings) {
        const settings = profileData.settings;
        
        if (typeof settings === 'object') {
          if ('darkMode' in settings) setDarkMode(settings.darkMode);
          if ('fontSize' in settings) setFontSize(settings.fontSize);
          
          if ('language' in settings) setLanguage(settings.language);
          if ('dateFormat' in settings) setDateFormat(settings.dateFormat);
          if ('currency' in settings) setCurrency(settings.currency);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar suas configurações. Tente novamente mais tarde.",
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user?.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentSettings = profileData?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        darkMode,
        fontSize,
        language,
        dateFormat,
        currency
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          settings: updatedSettings
        })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Alterações salvas",
        description: "Todas as configurações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações. Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <Button 
          className="bg-fin-green hover:bg-fin-green/90 text-black"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
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
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metodos" className="mt-0">
              <StripeIntegration />
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
            
            <TabsContent value="seguranca" className="mt-0">
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Gerencie a segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Senha atual</label>
                    <Input 
                      type="password" 
                      className="bg-[#2A2A2E] border-[#3A3A3E]" 
                      placeholder="Digite sua senha atual" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Nova senha</label>
                    <Input 
                      type="password" 
                      className="bg-[#2A2A2E] border-[#3A3A3E]" 
                      placeholder="Digite uma nova senha" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Confirmar nova senha</label>
                    <Input 
                      type="password" 
                      className="bg-[#2A2A2E] border-[#3A3A3E]" 
                      placeholder="Confirme sua nova senha" 
                    />
                  </div>
                  <Button className="w-full mt-4 bg-fin-green hover:bg-fin-green/90 text-black">
                    Atualizar senha
                  </Button>
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
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Compartilhar dados de uso anônimos</p>
                        <p className="text-xs text-[#94949F]">Ajude-nos a melhorar o aplicativo compartilhando dados anônimos de uso</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-[#2A2A2E]" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Receber emails de marketing</p>
                        <p className="text-xs text-[#94949F]">Receba emails sobre novos recursos e promoções</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full mt-6">
                    Solicitar exclusão dos meus dados
                  </Button>
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
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Modo escuro</p>
                        <p className="text-xs text-[#94949F]">Usar o tema escuro em toda a aplicação</p>
                      </div>
                      <Switch 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    <Separator className="bg-[#2A2A2E]" />
                    <div className="space-y-2">
                      <label className="text-sm text-[#94949F]">Tamanho da fonte</label>
                      <RadioGroup 
                        value={fontSize} 
                        onValueChange={setFontSize} 
                        className="flex gap-2"
                      >
                        <div className="flex-1">
                          <Button 
                            variant="outline" 
                            className={`border-[#3A3A3E] w-full ${fontSize === 'small' ? 'bg-fin-green/10 text-fin-green' : ''}`}
                            onClick={() => setFontSize('small')}
                          >
                            Pequeno
                          </Button>
                        </div>
                        <div className="flex-1">
                          <Button 
                            variant="outline" 
                            className={`border-[#3A3A3E] w-full ${fontSize === 'medium' ? 'bg-fin-green/10 text-fin-green' : ''}`}
                            onClick={() => setFontSize('medium')}
                          >
                            Médio
                          </Button>
                        </div>
                        <div className="flex-1">
                          <Button 
                            variant="outline" 
                            className={`border-[#3A3A3E] w-full ${fontSize === 'large' ? 'bg-fin-green/10 text-fin-green' : ''}`}
                            onClick={() => setFontSize('large')}
                          >
                            Grande
                          </Button>
                        </div>
                      </RadioGroup>
                    </div>
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
                  <div className="text-center py-8 text-[#94949F]">
                    <p>Você não possui aplicativos conectados no momento.</p>
                    <Button className="mt-4 bg-fin-green hover:bg-fin-green/90 text-black">
                      Conectar aplicativo
                    </Button>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Idioma</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Formato de data</label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="w-full bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectValue placeholder="Selecione um formato" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[#94949F]">Moeda padrão</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-full bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectValue placeholder="Selecione uma moeda" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2A2A2E] border-[#3A3A3E] text-white">
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
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
