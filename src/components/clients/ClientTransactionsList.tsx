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
import { Loader2, Check, RefreshCcw, Clock, AlertTriangle } from "lucide-react";
import { format, addMonths, parseISO, isAfter, isBefore } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  date: string;
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
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const { data: originalTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .eq('type', 'income')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (originalTransactions) {
        const processedTransactions: Transaction[] = [];
        
        originalTransactions.forEach(transaction => {
          processedTransactions.push({
            id: transaction.id,
            date: format(new Date(transaction.date), 'dd/MM/yyyy'),
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
                case 'monthly': return 24; // Show for 2 years
                case 'bimonthly': return 12; // Show for 2 years
                case 'quarterly': return 8; // Show for 2 years
                case 'biannual': return 4; // Show for 2 years
                case 'annual': return 2; // Show for 2 years
                default: return 0;
              }
            };
            
            const monthsToAdd = getMonthsToAdd(transaction.recurrence);
            const occurrences = getOccurrences(transaction.recurrence);
            const originalDate = new Date(transaction.date);
            
            if (monthsToAdd > 0) {
              for (let i = 1; i <= occurrences; i++) {
                const futureDate = addMonths(originalDate, monthsToAdd * i);
                
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
        });
        
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (!clientError && clientData && clientData.monthly_value && 
            clientData.recurring_payment && 
            clientData.status === 'active' && 
            clientData.contract_start) {
          
          const contractStartDate = new Date(clientData.contract_start);
          const contractEndDate = clientData.contract_end ? new Date(clientData.contract_end) : addMonths(new Date(), 24); // Default to 2 years if no end date
          
          let currentDate = new Date(contractStartDate);
          let paymentCount = 0;
          
          while (currentDate <= contractEndDate && paymentCount < 24) {
            if (currentDate >= contractStartDate) {
              const paymentDate = format(currentDate, 'dd/MM/yyyy');
              
              if (!processedTransactions.some(t => 
                  format(parseISO(t.date.split('/').reverse().join('-')), 'yyyy-MM') === 
                  format(currentDate, 'yyyy-MM') && 
                  t.description.includes('Contrato'))) {
                
                const yearMonth = format(currentDate, 'yyyy-MM');
                const contractTransactionId = `contract-${yearMonth}-${clientId.substring(0, 8)}`;
                
                processedTransactions.push({
                  id: contractTransactionId,
                  date: paymentDate,
                  description: `Contrato mensal - ${clientData.name}`,
                  category: 'Contrato',
                  type: 'income',
                  value: Number(clientData.monthly_value),
                  status: 'pending',
                  recurrence: 'monthly',
                  recurrence_count: paymentCount
                });
              }
            }
            
            currentDate = addMonths(currentDate, 1);
            paymentCount++;
          }
        }
        
        processedTransactions.sort((a, b) => {
          const dateA = parseISO(a.date.split('/').reverse().join('-'));
          const dateB = parseISO(b.date.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
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

  const handleMarkAsCompleted = async (transaction: Transaction) => {
    try {
      if (transaction.id.includes('recurrence')) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível marcar como recebido um pagamento recorrente futuro.",
          variant: "destructive"
        });
        return;
      }
      
      if (transaction.id.startsWith('contract-')) {
        setProcessingId(transaction.id);
        
        const dateParts = transaction.date.split('/');
        const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
        if (!user || !user.id) {
          throw new Error("Usuário não autenticado");
        }
        
        const { data: newTransaction, error: insertError } = await supabase
          .from('transactions')
          .insert({
            description: transaction.description,
            date: isoDate,
            value: transaction.value,
            category: transaction.category,
            type: 'income',
            status: 'completed',
            client_id: clientId,
            user_id: user.id
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        toast({
          title: "Recebimento confirmado",
          description: "O recebimento do contrato foi registrado com sucesso",
        });
        
        fetchTransactions();
        return;
      }
      
      setProcessingId(transaction.id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

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

  const handleMarkAsPending = async (transaction: Transaction) => {
    try {
      if (transaction.id.includes('recurrence') || transaction.id.startsWith('contract-')) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível alterar o status de um pagamento que ainda não existe no banco de dados.",
          variant: "destructive"
        });
        return;
      }
      
      setProcessingId(transaction.id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'pending' })
        .eq('id', transaction.id);

      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: "A transação foi marcada como pendente",
      });
      
      fetchTransactions();
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

  const handleMarkAsOverdue = async (transaction: Transaction) => {
    try {
      if (transaction.id.includes('recurrence') || transaction.id.startsWith('contract-')) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível alterar o status de um pagamento que ainda não existe no banco de dados.",
          variant: "destructive"
        });
        return;
      }
      
      setProcessingId(transaction.id);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'overdue' })
        .eq('id', transaction.id);

      if (error) throw error;
      
      toast({
        title: "Status atualizado",
        description: "A transação foi marcada como atrasada",
      });
      
      fetchTransactions();
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
          <Check className="h-3 w-3 mr-1" /> Recebido
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
                className={`hover:bg-[#1F1F23] border-[#2A2A2E] ${
                  transaction.id.includes('recurrence') || transaction.id.startsWith('contract-') 
                    ? 'bg-[#1A1A1E]/30' 
                    : ''
                }`}
              >
                <TableCell className="font-medium">
                  {transaction.date}
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
                <TableCell>
                  {getStatusBadge(transaction.status)}
                  {(transaction.recurrence_count || transaction.id.startsWith('contract-')) && transaction.status === 'pending' && (
                    <span className="ml-1 text-xs text-fin-green"> (Futuro)</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold text-fin-green">
                  {transaction.value.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {transaction.status !== "completed" && (
                      <Button 
                        variant="receipt" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleMarkAsCompleted(transaction)}
                        disabled={processingId === transaction.id}
                        title="Marcar como recebido"
                      >
                        {processingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {!transaction.id.includes('recurrence') && !transaction.id.startsWith('contract-') && (
                      <>
                        {transaction.status !== "pending" && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleMarkAsPending(transaction)}
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
                            onClick={() => handleMarkAsOverdue(transaction)}
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
