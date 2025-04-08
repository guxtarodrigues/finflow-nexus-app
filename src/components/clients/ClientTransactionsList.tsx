
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
import { MarkAsReceivedButton } from "@/components/clients/MarkAsReceivedButton";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
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

interface ClientTransactionsListProps {
  clientId: string;
}

export const ClientTransactionsList = ({ clientId }: ClientTransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', clientId)
        .eq('type', 'income')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedTransactions = data.map(item => ({
          id: item.id,
          date: format(new Date(item.date), 'dd/MM/yyyy'),
          description: item.description,
          category: item.category,
          type: item.type,
          value: Number(item.value),
          status: item.status
        }));
        
        setTransactions(formattedTransactions);
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
    <div className="rounded-md border border-[#2A2A2E]">
      <Table>
        <TableHeader className="bg-[#1F1F23]">
          <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
            <TableHead className="w-[100px]">Data</TableHead>
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
              <TableRow key={transaction.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                <TableCell className="font-medium">{transaction.date}</TableCell>
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
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.status === 'pending' && (
                    <MarkAsReceivedButton 
                      transactionId={transaction.id}
                      onStatusChange={fetchTransactions}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
