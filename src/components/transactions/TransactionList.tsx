
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
import { Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";

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
}

export const TransactionList = ({ 
  transactions, 
  loading, 
  onDeleteTransaction 
}: TransactionListProps) => {
  return (
    <div className="rounded-md border border-[#2A2A2E]">
      <Table>
        <TableHeader className="bg-[#1F1F23]">
          <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
            <TableHead className="w-[50px]">Tipo</TableHead>
            <TableHead className="w-[100px]">Data</TableHead>
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
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onDeleteTransaction(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
