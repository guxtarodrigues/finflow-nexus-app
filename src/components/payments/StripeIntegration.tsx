
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Check, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export function StripeIntegration() {
  const { toast } = useToast();

  const handleConnectStripe = () => {
    // Aqui seria implementada a integração real com o Stripe
    toast({
      title: "Integração em desenvolvimento",
      description: "A integração com o Stripe será implementada em breve.",
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

        <Button 
          onClick={handleConnectStripe} 
          className="w-full mt-4 bg-fin-green hover:bg-fin-green/90 text-black"
        >
          <Lock className="mr-2 h-4 w-4" />
          Configurar integração com Stripe
        </Button>
      </CardContent>
    </Card>
  );
}
