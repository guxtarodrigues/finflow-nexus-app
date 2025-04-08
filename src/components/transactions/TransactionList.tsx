
import { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, ArrowUp, ArrowDown, Check, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  value: number;
  status: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDeleteTransaction: (id: string) => void;
  onStatusChange?: () => void;
  showStatusActions?: boolean;
}

export const TransactionList = ({ 
  transactions, 
  loading, 
  onDeleteTransaction,
  onStatusChange,
  showStatusActions = true
}: TransactionListProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMarkAsComplete = async (id: string) => {
    try {
      setProcessingId(id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      toast({
        title: "Status atualizado",
        description: "A transação foi marcada como concluída com sucesso",
      });
    } catch (error: any) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsPending = async (id: string) => {
    try {
      setProcessingId(id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'pending' })
        .eq('id', id);

      if (error) throw error;
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      toast({
        title: "Status atualizado",
        description: "A transação foi marcada como pendente",
      });
    } catch (error: any) {
      console.error('Error marking as pending:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsOverdue = async (id: string) => {
    try {
      setProcessingId(id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'overdue' })
        .eq('id', id);

      if (error) throw error;
      
      if (onStatusChange) {
        onStatusChange();
      }
      
      toast({
        title: "Status atualizado",
        description: "A transação foi marcada como atrasada",
      });
    } catch (error: any) {
      console.error('Error marking as overdue:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
          <Check className="h-3 w-3 mr-1" /> Concluído
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
          <Clock className="h-3 w-3 mr-1" /> Pendente
        </span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
          <AlertTriangle className="h-3 w-3 mr-1" /> Atrasado
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500">
          {status}
        </span>;
    }
  };

  return (
    <div className="rounded-md border border-[#2A2A2E]">
      <Table>
        <TableHeader className="bg-[#1F1F23]">
          <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
            <TableHead className="w-[50px]">Tipo</TableHead>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 text-fin-green animate-spin mr-2" />
                  <span>Carregando transações...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                <TableCell>
                  {transaction.type === "income" ? (
                    <div className="flex items-center justify-center bg-green-500/10 rounded-full w-8 h-8">
                      <ArrowUp className="h-5 w-5 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-red-500/10 rounded-full w-8 h-8">
                      <ArrowDown className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === "income" ? "success" : "destructive"} className="bg-opacity-20 text-xs">
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  transaction.type === "income" ? "text-fin-green" : "text-fin-red"
                }`}>
                  {transaction.type === "income" ? "+" : "-"} 
                  {transaction.value.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {showStatusActions && (
                      <>
                        {transaction.status !== "completed" && (
                          <Button 
                            variant="receipt" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleMarkAsComplete(transaction.id)}
                            disabled={processingId === transaction.id}
                            title="Marcar como concluído"
                          >
                            {processingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {transaction.status !== "pending" && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleMarkAsPending(transaction.id)}
                            disabled={processingId === transaction.id}
                            title="Marcar como pendente"
                          >
                            {processingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {transaction.status !== "overdue" && (
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8 bg-red-500/20 hover:bg-red-500/30 text-red-500"
                            onClick={() => handleMarkAsOverdue(transaction.id)}
                            disabled={processingId === transaction.id}
                            title="Marcar como atrasado"
                          >
                            {processingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onDeleteTransaction(transaction.id)}
                      title="Excluir transação"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
