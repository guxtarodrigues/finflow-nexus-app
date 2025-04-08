
import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Tag
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { DateFilter } from "@/components/payments/DateFilter";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { BlurModal } from "@/components/ui/blur-modal";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@/types";

// Define the Transaction type based on the database schema
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  category_id?: string;
  type: string;
  value: number;
  status: string;
}

const Movimentacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  
  // Date filter states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [dateFilterMode, setDateFilterMode] = useState<"current" | "prev" | "next" | "custom">("current");
  
  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    category_id: "",
    type: "income",
    value: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    }
  }, [filterType, user, dateRange]);

  // Update date range when date filter mode changes
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
      // Custom range is handled directly by the date picker
    }
  }, [dateFilterMode, currentDate]);

  const fetchTransactions = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: false });
      
      // Apply filter if set
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
      
      // Format the transactions data
      const formattedTransactions = data.map((item) => ({
        id: item.id,
        date: format(new Date(item.date), 'dd/MM/yyyy'),
        description: item.description,
        category: item.category,
        category_id: item.category_id,
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

  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredCategories = (type: string) => {
    return categories.filter(category => 
      type === "all" || category.type === type || category.type === "investment"
    );
  };

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return { name: "", color: "#6E59A5" };
    const category = categories.find(c => c.id === categoryId);
    return { 
      name: category ? category.name : "", 
      color: category ? category.color || "#6E59A5" : "#6E59A5" 
    };
  };

  const handleCreateTransaction = async () => {
    try {
      if (!user) return;
      
      if (!newTransaction.description || !newTransaction.value || !newTransaction.category_id) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const categoryInfo = getCategoryInfo(newTransaction.category_id);
      
      // Insert single object (not an array) and format data correctly
      const { error } = await supabase
        .from('transactions')
        .insert({
          description: newTransaction.description,
          category: categoryInfo.name,
          category_id: newTransaction.category_id,
          type: newTransaction.type,
          value: newTransaction.value,
          date: new Date().toISOString(),
          status: 'completed',
          user_id: user.id
        });

      if (error) throw error;
      
      // Reset form and close dialog
      setNewTransaction({
        description: "",
        category_id: "",
        type: "income",
        value: 0
      });
      setIsModalOpen(false);
      
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

  // Date filter handlers
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

  // Filter transactions based on search term and active tab
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      // Filter by search term
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tab
      if (activeTab === "all") {
        return matchesSearch;
      } else if (activeTab === "income" || activeTab === "expense") {
        return matchesSearch && transaction.type === activeTab;
      }
      
      return matchesSearch;
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Gerenciamento de receitas e despesas
          </p>
        </div>
        <Button 
          className="bg-fin-green text-black hover:bg-fin-green/90"
          onClick={() => {
            setNewTransaction({
              description: "",
              category_id: "",
              type: "income",
              value: 0
            });
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-normal flex items-center">
                <ArrowLeftRight className="mr-2 h-5 w-5 text-fin-green" />
                Todas as Movimentações
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
                    {/* Date filter component */}
                    <DateFilter 
                      dateRange={dateRange}
                      dateFilterMode={dateFilterMode}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={handleNextMonth}
                      onCurrentMonth={handleCurrentMonth}
                      onDateRangeChange={handleDateRangeChange}
                    />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                          <Filter className="mr-2 h-4 w-4" /> Filtrar
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
                  transactions={getFilteredTransactions()}
                  categories={categories}
                  loading={loading}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-5">
          {/* Similar content as "all" tab but filtered for income */}
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-5">
          {/* Similar content as "all" tab but filtered for expense */}
        </TabsContent>
      </Tabs>
      
      {/* Add Transaction Modal */}
      <BlurModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">Nova Movimentação</h2>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova transação para controlar suas finanças
            </p>
          </div>
          
          <Tabs defaultValue={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="income" className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-400" /> Receita
              </TabsTrigger>
              <TabsTrigger value="expense" className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-400" /> Despesa
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  className="bg-white/10 border-white/20"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Categoria
                </Label>
                <Select
                  value={newTransaction.category_id}
                  onValueChange={(value) => setNewTransaction({...newTransaction, category_id: value})}
                >
                  <SelectTrigger id="category" className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories(newTransaction.type).map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || "#6E59A5" }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="value">Valor</Label>
                <CurrencyInput
                  id="value"
                  className="bg-white/10 border-white/20"
                  value={newTransaction.value}
                  onValueChange={(value) => setNewTransaction({...newTransaction, value})}
                />
              </div>
            </div>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="border-white/20"
            >
              Cancelar
            </Button>
            <Button 
              className={newTransaction.type === "income" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
              onClick={handleCreateTransaction}
            >
              Salvar
            </Button>
          </div>
        </div>
      </BlurModal>
    </div>
  );
};

export default Movimentacoes;
