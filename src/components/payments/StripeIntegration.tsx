
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Check, Lock, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function StripeIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasStripeSubscription, setHasStripeSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      checkStripeStatus();
    }
  }, [user]);

  const checkStripeStatus = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user?.id)
        .single();

      if (profileData?.settings?.stripeCustomerId) {
        setHasStripeSubscription(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status do Stripe:', error);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      
      // Em um cenário real, aqui faria uma chamada para uma Edge Function
      // que criaria uma sessão de checkout do Stripe
      // e retornaria a URL para redirecionamento
      
      // Simulando o processo para demonstração
      setTimeout(() => {
        // Atualizar o perfil do usuário com as informações do Stripe
        updateUserStripeInfo();
        
        toast({
          title: "Integração com Stripe iniciada",
          description: "Você seria redirecionado para a página de checkout do Stripe.",
        });
        
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Erro na integração com Stripe:', error);
      toast({
        variant: "destructive",
        title: "Erro na integração",
        description: "Não foi possível conectar com o Stripe. Tente novamente mais tarde.",
      });
      setLoading(false);
    }
  };

  const updateUserStripeInfo = async () => {
    try {
      // Simulando um ID de cliente do Stripe para demonstração
      const mockStripeCustomerId = 'cus_' + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            stripeCustomerId: mockStripeCustomerId,
            stripeSubscriptionStatus: 'active',
            stripeSubscriptionId: 'sub_' + Math.random().toString(36).substring(2, 15),
            stripeSubscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias a partir de agora
          }
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      setHasStripeSubscription(true);
      
      toast({
        title: "Integração concluída",
        description: "Seu perfil foi atualizado com as informações do Stripe.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil com informações do Stripe:', error);
    }
  };

  const handleManageSubscription = () => {
    toast({
      title: "Gerenciar assinatura",
      description: "Em um cenário real, você seria redirecionado para o portal de clientes do Stripe.",
    });
  };

  return (
    <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-fin-green" />
          Integração com Stripe
        </CardTitle>
        <CardDescription className="text-[#94949F]">
          Gerencie suas assinaturas e métodos de pagamento de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-[#2A2A2E] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-fin-green/10 p-2 mt-1">
              <ShieldCheck className="h-5 w-5 text-fin-green" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Pagamentos seguros</h3>
              <p className="text-xs text-[#94949F]">
                O Stripe oferece uma experiência de pagamento segura e compatível com os padrões PCI.
                Seus dados de pagamento são criptografados e armazenados com segurança.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-fin-green" />
            <span className="text-sm text-[#94949F]">Integração com diversos cartões de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-fin-green" />
            <span className="text-sm text-[#94949F]">Pagamento seguro e criptografado</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-fin-green" />
            <span className="text-sm text-[#94949F]">Gerenciamento de assinaturas recorrentes</span>
          </div>
        </div>

        {hasStripeSubscription ? (
          <div className="space-y-4">
            <div className="bg-fin-green/10 p-3 rounded-md border border-fin-green/20">
              <p className="text-sm text-fin-green flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Sua assinatura está ativa
              </p>
            </div>
            <Button 
              onClick={handleManageSubscription} 
              className="w-full bg-fin-green hover:bg-fin-green/90 text-black"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Gerenciar assinatura
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleConnectStripe} 
            className="w-full mt-4 bg-fin-green hover:bg-fin-green/90 text-black"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Configurar integração com Stripe
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
