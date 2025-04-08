
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarkAsReceivedButtonProps {
  transactionId: string;
  onStatusChange: () => void;
}

export const MarkAsReceivedButton = ({ 
  transactionId, 
  onStatusChange 
}: MarkAsReceivedButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMarkAsReceived = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (error) throw error;
      
      onStatusChange();
      
      toast({
        title: "Recebimento confirmado",
        description: "O recebimento foi marcado como recebido com sucesso",
      });
    } catch (error: any) {
      console.error('Error marking as received:', error);
      toast({
        title: "Erro ao confirmar recebimento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="receipt"
      onClick={handleMarkAsReceived}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          Marcar como Recebido
        </>
      )}
    </Button>
  );
};
