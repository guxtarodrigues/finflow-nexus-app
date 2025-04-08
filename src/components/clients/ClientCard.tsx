
import { useState } from 'react';
import { format } from "date-fns";
import { 
  Edit2, 
  Calendar, 
  Mail, 
  Phone, 
  CircleDollarSign, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types/clients";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onStatusChange: () => void;
}

export const ClientCard = ({ client, onEdit, onDelete, onStatusChange }: ClientCardProps) => {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00";
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const getStatusColor = (status: string | null) => {
    if (status === 'active') return "text-green-500";
    if (status === 'inactive') return "text-red-500";
    return "text-gray-500";
  };

  const getStatusIcon = (status: string | null) => {
    if (status === 'active') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'inactive') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const handleMarkAsReceived = async () => {
    if (!client.monthly_value) {
      toast({
        title: "Valor mensal não definido",
        description: "Este cliente não possui um valor mensal definido.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessingId(client.id);
      
      // Create a transaction record for the received payment
      const { error } = await supabase
        .from('transactions')
        .insert({
          type: 'income',
          category: 'Recebimento de Cliente',
          value: client.monthly_value,
          description: `Pagamento de ${client.name}`,
          status: 'completed',
          date: new Date().toISOString(),
          client_id: client.id,
          user_id: client.user_id
        });

      if (error) throw error;
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso",
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error('Error registering payment:', error);
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="overflow-hidden border-[#2A2A2E] bg-[#1A1A1E]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-normal">{client.name}</CardTitle>
          <div className={`flex items-center gap-1 text-sm ${getStatusColor(client.status)}`}>
            {getStatusIcon(client.status)}
            <span>{client.status === 'active' ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          {(client.email || client.phone) && (
            <div className="space-y-1">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          )}
          
          {client.contract_start && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(client.contract_start), 'dd/MM/yyyy')}
                {client.contract_end && ` até ${format(new Date(client.contract_end), 'dd/MM/yyyy')}`}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-fin-green" />
            <span className="font-medium">
              {formatCurrency(client.monthly_value)}
              {client.recurring_payment && <Badge variant="outline" className="ml-2 bg-fin-green/10 text-fin-green text-[10px]">Recorrente</Badge>}
            </span>
          </div>
          
          {client.description && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="line-clamp-2">{client.description}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-[#1F1F23] border-t border-[#2A2A2E] p-3 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(client)}
          className="text-xs"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Editar
        </Button>
        
        {client.status === 'active' && client.monthly_value && (
          <Button 
            variant="receipt" 
            size="icon"
            onClick={handleMarkAsReceived}
            disabled={processingId === client.id}
            className="rounded-full w-8 h-8"
          >
            {processingId === client.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CircleDollarSign className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
