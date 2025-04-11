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
import { Trash2, Loader2, ArrowUp, ArrowDown, Check } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@/types/transactions";

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDeleteTransaction: (id: string) => void;
  onStatusChange?: () => void;
}

export const TransactionList = ({ 
  transactions, 
  loading, 
  onDeleteTransaction,
  onStatusChange 
}: TransactionListProps) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.due_date.split('/').reverse().join('-'));
    const dateB = new Date(b.due_date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });

  function handleMarkAsReceived(id: string) {
    try {
      setProcessingId(id);
      
      supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
          
          if (onStatusChange) {
            onStatusChange();
          }
          
          toast({
            title: "Recebimento confirmado",
            description: "O recebimento foi marcado como recebido com sucesso",
          });
        })
        .catch((error) => {
          console.error('Error marking as received:', error);
          toast({
            title: "Erro ao confirmar recebimento",
            description: error.message,
            variant: "destructive"
          });
        })
        .finally(() => {
          setProcessingId(null);
        });
    } catch (error: any) {
      console.error('Error in handleMarkAsReceived:', error);
      setProcessingId(null);
    }
  }

  function handleConfirmDelete() {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setDeleteConfirmOpen(false);
    }
  }

  function handleDeleteClick(id: string) {
    setTransactionToDelete(id);
    setDeleteConfirmOpen(true);
  }

  return (
    <>
      <div className="rounded-md border border-[#2A2A2E]">
        <Table>
          <TableHeader className="bg-[#1F1F23]">
            <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
              <TableHead className="w-[50px]">Tipo</TableHead>
              <TableHead className="w-[100px]">Data de Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 text-fin-green animate-spin mr-2" />
                    <span>Carregando transações...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction) => (
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
                  <TableCell className="font-medium">{transaction.due_date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "success" : "destructive"} className="bg-opacity-20 text-xs">
                      {transaction.category}
                    </Badge>
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
                    <div className="flex justify-end gap-2">
                      {transaction.type === "income" && transaction.status === "pending" ? (
                        <Button 
                          variant="receipt" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleMarkAsReceived(transaction.id)}
                          disabled={processingId === transaction.id}
                        >
                          {processingId === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteClick(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#1A1A1E] border-[#2A2A2E]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1F1F23] border-[#2A2A2E] hover:bg-[#2A2A2E] hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-fin-red hover:bg-fin-red/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
