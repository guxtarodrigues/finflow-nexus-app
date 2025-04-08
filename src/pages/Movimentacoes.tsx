
import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Loader2,
  Calendar,
  CalendarIcon
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { DateFilter } from "@/components/payments/DateFilter";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  value: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "investment";
  color: string;
}

const Movimentacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [dateFilterMode, setDateFilterMode] = useState<"current" | "prev" | "next" | "custom">("current");
  
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    category_id: "",
    type: "income",
    value: "",
    date: format(new Date(), "yyyy-MM-dd")
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    }
  }, [filterType, user, dateRange]);

  useEffect(() => {
    switch (dateFilterMode) {
      case "current":
        setDateRange({
          from: startOfMonth(currentDate),
          to: endOfMonth(currentDate)
        });
        break;
      case "prev":
        setDateRange({
          from: startOfMonth(subMonths(currentDate, 1)),
          to: endOfMonth(subMonths(currentDate, 1))
        });
        break;
      case "next":
        setDateRange({
          from: startOfMonth(addMonths(currentDate, 1)),
          to: endOfMonth(addMonths(currentDate, 1))
        });
        break;
    }
  }, [dateFilterMode, currentDate]);

  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      setLoadingCategories(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setCategories(data as Category[]);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')  // Apenas transações completadas são mostradas em Movimentações
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: false });
      
      if (filterType) {
        if (filterType === 'income' || filterType === 'expense') {
          query = query.eq('type', filterType);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data) {
        setTransactions([]);
        return;
      }
      
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
      if (!user) return;
      
      if (!newTransaction.description || !newTransaction.category_id || !newTransaction.value || !newTransaction.date) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const selectedCategory = categories.find(cat => cat.id === newTransaction.category_id);
      if (!selectedCategory) {
        toast({
          title: "Categoria inválida",
          description: "Selecione uma categoria válida",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          description: newTransaction.description,
          category: selectedCategory.name,
          category_id: newTransaction.category_id,
          type: newTransaction.type,
          value: Number(newTransaction.value),
          date: new Date(newTransaction.date).toISOString(),
          status: 'completed', // Por padrão, já marcamos como 'completed'
          user_id: user.id
        });

      if (error) throw error;
      
      setNewTransaction({
        description: "",
        category_id: "",
        type: "income",
        value: "",
        date: format(new Date(), "yyyy-MM-dd")
      });
      setIsDialogOpen(false);
      
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

  const handleStatusChange = () => {
    fetchTransactions();
  };

  const handlePrevMonth = () => {
    setDateFilterMode("prev");
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setDateFilterMode("next");
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleCurrentMonth = () => {
    setDateFilterMode("current");
    setCurrentDate(new Date());
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateFilterMode("custom");
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category => 
    category.type === newTransaction.type || category.type === "investment"
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Visualização de todas as receitas e despesas já efetivadas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90">
              <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>
                Adicione uma nova transação financeira ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Movimentação</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className={`flex-1 ${newTransaction.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    >
                      Receita
                    </Button>
                    <Button
                      type="button"
                      className={`flex-1 ${newTransaction.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                      onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    >
                      Despesa
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Salário, Aluguel, etc."
                    className="bg-[#1F1F23] border-[#2A2A2E]"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newTransaction.category_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, category_id: value})}
                  >
                    <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando...</span>
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-2 text-center">
                          <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada</p>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-1 text-fin-green" 
                            onClick={() => {
                              setIsDialogOpen(false);
                              // Add logic to navigate to categories page or open categories dialog
                            }}
                          >
                            Criar categoria
                          </Button>
                        </div>
                      ) : (
                        filteredCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="bg-[#1F1F23] border-[#2A2A2E]"
                      value={newTransaction.value}
                      onChange={(e) => setNewTransaction({...newTransaction, value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-[#1F1F23] border-[#2A2A2E]",
                              !newTransaction.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTransaction.date ? format(new Date(newTransaction.date), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={newTransaction.date ? new Date(newTransaction.date) : undefined}
                            onSelect={(date) => date && setNewTransaction({
                              ...newTransaction, 
                              date: format(date, "yyyy-MM-dd")
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
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
              Todas as Movimentações Efetivadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
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
                
                <div className="flex flex-wrap gap-2 items-center">
                  <DateFilter 
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onCurrentMonth={handleCurrentMonth}
                    dateFilterMode={dateFilterMode}
                    currentDate={currentDate}
                  />
                  
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
              
              <TransactionList 
                transactions={filteredTransactions}
                loading={loading}
                onDeleteTransaction={handleDeleteTransaction}
                onStatusChange={handleStatusChange}
                showStatusActions={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Movimentacoes;
