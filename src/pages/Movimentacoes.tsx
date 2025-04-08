
import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2,
  Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define the Transaction type
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  value: number;
  status: string;
}

const Movimentacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    category: "",
    type: "income",
    value: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      // Apply filter if set
      if (filterType) {
        if (filterType === 'income' || filterType === 'expense') {
          query = query.eq('type', filterType);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the transactions data
      const formattedTransactions = data.map((item) => ({
        id: item.id,
        date: format(new Date(item.date), 'dd/MM/yyyy'),
        description: item.description,
        category: item.category,
        type: item.type,
        value: Number(item.value),
        status: item.status
      }));
      
      setTransactions(formattedTransactions);
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

  const handleCreateTransaction = async () => {
    try {
      if (!newTransaction.description || !newTransaction.category || !newTransaction.value) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            description: newTransaction.description,
            category: newTransaction.category,
            type: newTransaction.type,
            value: Number(newTransaction.value),
            date: new Date(),
            status: 'completed'
          }
        ])
        .select();

      if (error) throw error;
      
      // Reset form and close dialog
      setNewTransaction({
        description: "",
        category: "",
        type: "income",
        value: ""
      });
      setIsDialogOpen(false);
      
      // Refresh transaction list
      await fetchTransactions();
      
      toast({
        title: "Transação criada",
        description: "A transação foi registrada com sucesso",
      });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh transaction list
      await fetchTransactions();
      
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso",
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Gerenciamento de receitas e despesas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90">
              <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>
                Adicione uma nova transação financeira ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Input
                  id="category"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <select
                  id="type"
                  className="col-span-3 bg-[#1F1F23] border border-[#2A2A2E] rounded-md h-10 px-3 text-base focus:outline-none"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Valor
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newTransaction.value}
                  onChange={(e) => setNewTransaction({...newTransaction, value: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="bg-fin-green text-black hover:bg-fin-green/90" 
                onClick={handleCreateTransaction}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-normal flex items-center">
              <ArrowLeftRight className="mr-2 h-5 w-5 text-fin-green" />
              Todas as Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar movimentações..."
                    className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                        <Filter className="mr-2 h-4 w-4" /> Filtrar
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterType(null)}>
                        Todas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('income')}>
                        Receitas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType('expense')}>
                        Despesas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                    <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border border-[#2A2A2E]">
                <Table>
                  <TableHeader className="bg-[#1F1F23]">
                    <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
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
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 text-fin-green animate-spin mr-2" />
                            <span>Carregando transações...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
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
                              onClick={() => handleDeleteTransaction(transaction.id)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Movimentacoes;
