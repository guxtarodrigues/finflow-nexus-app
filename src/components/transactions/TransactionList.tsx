
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction, Category } from "@/types";
import { format } from "date-fns";
import { Check, Clock, ArrowRight, Pencil, Trash2 } from "lucide-react";

export interface TransactionListProps {
  transactions: Transaction[];
  categories?: Category[];
  loading: boolean;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionList = ({ 
  transactions, 
  categories,
  loading, 
  onDeleteTransaction 
}: TransactionListProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDeleteTransaction(id);
    setDeleting(null);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories) return "-";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "-";
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId || !categories) return "#6E59A5";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#6E59A5";
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.description}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {transaction.category_id && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(transaction.category_id) }}
                  />
                )}
                {transaction.category_id ? getCategoryName(transaction.category_id) : transaction.category}
              </div>
            </TableCell>
            <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
            <TableCell className={transaction.type === 'income' ? 'text-fin-green' : 'text-fin-red'}>
              {formatCurrency(transaction.value)}
            </TableCell>
            <TableCell>
              {transaction.status === 'completed' ? (
                <Badge variant="outline" className="bg-fin-green/20 text-fin-green border-0">
                  <Check className="mr-1 h-3 w-3" /> Concluído
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-0">
                  <Clock className="mr-1 h-3 w-3" /> Pendente
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(transaction.id)}
                  disabled={!!deleting}
                >
                  {deleting === transaction.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
