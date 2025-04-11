
import { useState, useEffect } from 'react';
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
import { Loader2, Check, RefreshCcw, Trash2 } from "lucide-react";
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
import { format, addMonths, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  date: string;
  due_date: string;
  description: string;
  category: string;
  type: string;
  value: number;
  status: string;
  recurrence?: string | null;
  recurrence_count?: number | null;
}

interface ClientTransactionsListProps {
  clientId: string;
}

export const ClientTransactionsList = ({ clientId }: ClientTransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const { data: originalTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .eq('type', 'income')
        .order('due_date', { ascending: true }); // Change order to due_date
      
      if (error) throw error;
      
      if (originalTransactions) {
        const processedTransactions: Transaction[] = [];
        
        originalTransactions.forEach(transaction => {
          processedTransactions.push({
            id: transaction.id,
            date: format(new Date(transaction.date), 'dd/MM/yyyy'),
            due_date: transaction.due_date ? format(new Date(transaction.due_date), 'dd/MM/yyyy') : format(new Date(transaction.date), 'dd/MM/yyyy'),
            description: transaction.description,
            category: transaction.category,
            type: transaction.type,
            value: Number(transaction.value),
            status: transaction.status,
            recurrence: transaction.recurrence,
            recurrence_count: transaction.recurrence_count
          });
          
          if (transaction.recurrence && transaction.recurrence !== 'once') {
            const getMonthsToAdd = (recurrenceType: string) => {
              switch (recurrenceType) {
                case 'monthly': return 1;
                case 'bimonthly': return 2;
                case 'quarterly': return 3;
                case 'biannual': return 6;
                case 'annual': return 12;
                default: return 0;
              }
            };
            
            const getOccurrences = (recurrenceType: string) => {
              switch (recurrenceType) {
                case 'monthly': return 12;
                case 'bimonthly': return 6;
                case 'quarterly': return 4;
                case 'biannual': return 2;
                case 'annual': return 1;
                default: return 0;
              }
            };
            
            const monthsToAdd = getMonthsToAdd(transaction.recurrence);
            const occurrences = getOccurrences(transaction.recurrence);
            const originalDate = new Date(transaction.date);
            const currentDate = new Date();
            
            if (monthsToAdd > 0) {
              for (let i = 1; i <= occurrences; i++) {
                const futureDate = addMonths(originalDate, monthsToAdd * i);
                
                if (futureDate > currentDate) {
                  processedTransactions.push({
                    id: `${transaction.id}-recurrence-${i}`,
                    date: format(futureDate, 'dd/MM/yyyy'),
                    description: `${transaction.description} (Recorrente)`,
                    category: transaction.category,
                    type: transaction.type,
                    value: Number(transaction.value),
                    status: 'pending',
                    recurrence: transaction.recurrence,
                    recurrence_count: i
                  });
                }
              }
            }
          }
        });
        
        // Sort by due_date
        processedTransactions.sort((a, b) => {
          const dateA = parseISO(a.due_date.split('/').reverse().join('-'));
          const dateB = parseISO(b.due_date.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime(); // Ascending by due date
        });
        
        setTransactions(processedTransactions);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [clientId]);

  const handleMarkAsReceived = async (id: string) => {
    try {
      if (id.includes('recurrence')) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível marcar como recebido um pagamento recorrente futuro.",
          variant: "destructive"
        });
        return;
      }
      
      setProcessingId(id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Recebimento confirmado",
        description: "O recebimento foi marcado como recebido com sucesso",
      });
      
      fetchTransactions();
    } catch (error: any) {
      console.error('Error marking as received:', error);
      toast({
        title: "Erro ao confirmar recebimento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (id.includes('recurrence')) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível excluir um pagamento recorrente futuro desta forma.",
          variant: "destructive"
        });
        return;
      }
      
      setProcessingId(id);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso",
      });
      
      fetchTransactions();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Recebido';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="rounded-md border border-[#2A2A2E]">
        <Table>
          <TableHeader className="bg-[#1F1F23]">
            <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
              <TableHead className="w-[100px]">Data de Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
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
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada para este cliente.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id} 
                  className={`hover:bg-[#1F1F23] border-[#2A2A2E] ${transaction.id.includes('recurrence') ? 'bg-[#1A1A1E]/30' : ''}`}
                >
                  <TableCell className="font-medium">
                    {transaction.due_date}
                    {transaction.recurrence_count && (
                      <span className="ml-1">
                        <RefreshCcw className="h-3 w-3 inline text-fin-green" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-opacity-20 text-xs">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-fin-green">
                    {transaction.value.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                      {transaction.recurrence_count && (
                        <span className="ml-1 text-xs text-fin-green"> (Futuro)</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {transaction.status === 'pending' && !transaction.id.includes('recurrence') && (
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
                      )}
                      
                      {!transaction.id.includes('recurrence') && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 bg-red-500/10 hover:bg-red-500/20 border-0"
                          onClick={() => handleDeleteClick(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
