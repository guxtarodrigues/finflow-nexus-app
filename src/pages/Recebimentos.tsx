
import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Repeat,
  ArrowUp,
  ArrowRight,
  Tag,
  Edit,
  CheckCircle,
  CalendarIcon,
  DollarSign
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
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DateFilter } from "@/components/payments/DateFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  value: number;
  type: string;
  status: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "investment";
  color: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-fin-green/20 text-fin-green border-0">
          <Check className="mr-1 h-3 w-3" /> Recebido
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-0">
          <Clock className="mr-1 h-3 w-3" /> Pendente
        </Badge>
      );
    case "overdue":
      return (
        <Badge variant="outline" className="bg-fin-red/20 text-fin-red border-0">
          <AlertCircle className="mr-1 h-3 w-3" /> Atrasado
        </Badge>
      );
    default:
      return null;
  }
};

const Recebimentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
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
    client_id: "",
    category_id: "",
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "completed"
  });
  
  const [formErrors, setFormErrors] = useState<{
    description?: boolean;
    value?: boolean;
    date?: boolean;
    category_id?: boolean;
  }>({});
  
  const [dashboardData, setDashboardData] = useState({
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    monthlyAverage: 0,
    incomeCount: 0
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
      fetchClients();
      calculateDashboardData();
    }
  }, [filterStatus, user, dateRange]);

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
          from: startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)),
          to: endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
        });
        break;
      case "next":
        setDateRange({
          from: startOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)),
          to: endOfMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
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
        .eq('user_id', user.id)
        .eq('type', 'income');
      
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

  const fetchClients = async () => {
    try {
      if (!user) return;
      
      setLoadingClients(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setClients(data as Client[]);
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingClients(false);
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
        .eq('type', 'income')
        .order('date', { ascending: false });
      
      if (filterStatus) {
        query = query.eq('status', filterStatus);
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
        value: Number(item.value),
        type: item.type,
        status: item.status,
        category_id: item.category_id
      }));
      
      const filteredByDate = formattedTransactions.filter(transaction => {
        try {
          const txDate = parseISO(transaction.date.split('/').reverse().join('-'));
          return isWithinInterval(txDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        } catch (error) {
          return false;
        }
      });
      
      setTransactions(filteredByDate);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro ao carregar recebimentos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = async () => {
    try {
      if (!user) return;

      const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income');

      if (error) throw error;

      if (!allTransactions) return;

      const completedTransactions = allTransactions.filter(tx => tx.status === 'completed');
      const pendingTransactions = allTransactions.filter(tx => tx.status === 'pending');
      const overdueTransactions = allTransactions.filter(tx => tx.status === 'overdue');
      
      const totalReceived = completedTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      const totalPending = pendingTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      const totalOverdue = overdueTransactions.reduce((sum, tx) => sum + Number(tx.value), 0);
      
      // Calculate monthly average for the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      const last6MonthsTransactions = completedTransactions.filter(tx => 
        new Date(tx.date) >= sixMonthsAgo
      );
      
      const monthlyAverage = last6MonthsTransactions.length > 0 
        ? totalReceived / 6 
        : 0;

      setDashboardData({
        totalReceived,
        totalPending,
        totalOverdue,
        monthlyAverage,
        incomeCount: completedTransactions.length
      });
    } catch (error: any) {
      console.error('Error calculating dashboard data:', error);
      toast({
        title: "Erro ao calcular dados do dashboard",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClientChange = (clientId: string) => {
    setNewTransaction({
      ...newTransaction,
      client_id: clientId
    });
  };

  const handleAddTransaction = async () => {
    try {
      if (!user) return;
      
      const errors: {
        description?: boolean;
        value?: boolean;
        date?: boolean;
        category_id?: boolean;
      } = {};
      
      if (!newTransaction.description) errors.description = true;
      if (!newTransaction.value) errors.value = true;
      if (!newTransaction.date) errors.date = true;
      if (!newTransaction.category_id) errors.category_id = true;
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos destacados em vermelho para continuar.",
          variant: "destructive"
        });
        return;
      }
      
      setFormErrors({});
      
      // Get category name
      const selectedCategory = categories.find(cat => cat.id === newTransaction.category_id);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: newTransaction.description,
          category: selectedCategory ? selectedCategory.name : 'Outros',
          category_id: newTransaction.category_id,
          value: parseFloat(newTransaction.value),
          date: newTransaction.date,
          type: 'income',
          status: newTransaction.status
        });
      
      if (error) throw error;
      
      toast({
        title: "Recebimento adicionado",
        description: "O recebimento foi adicionado com sucesso.",
      });
      
      setNewTransaction({
        description: "",
        client_id: "",
        category_id: "",
        value: "",
        date: format(new Date(), "yyyy-MM-dd"),
        status: "completed"
      });
      
      setIsDialogOpen(false);
      fetchTransactions();
      calculateDashboardData();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erro ao adicionar recebimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recebimentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus recebimentos e receitas.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-fin-green text-black hover:bg-fin-green/90">
                <Plus className="mr-2 h-4 w-4" /> Novo Recebimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
              <DialogHeader>
                <DialogTitle>Novo Recebimento</DialogTitle>
                <DialogDescription>
                  Adicione um novo recebimento para controlar suas finanças.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className={formErrors.description ? "text-fin-red" : ""}>Descrição *</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Pagamento do cliente, Venda de produto, etc."
                      className={cn(
                        "bg-[#1F1F23] border-[#2A2A2E]",
                        formErrors.description ? "border-fin-red focus-visible:ring-fin-red" : ""
                      )}
                      value={newTransaction.description}
                      onChange={(e) => {
                        setNewTransaction({...newTransaction, description: e.target.value});
                        if (e.target.value) {
                          setFormErrors({...formErrors, description: false});
                        }
                      }}
                    />
                    {formErrors.description && (
                      <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Cliente
                    </Label>
                    <Select
                      value={newTransaction.client_id}
                      onValueChange={handleClientChange}
                    >
                      <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                        <SelectValue placeholder="Selecione um cliente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingClients ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Carregando...</span>
                          </div>
                        ) : clients.length === 0 ? (
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                          </div>
                        ) : (
                          clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className={cn(
                      "flex items-center gap-1",
                      formErrors.category_id ? "text-fin-red" : ""
                    )}>
                      <Tag className="h-4 w-4" /> Categoria *
                    </Label>
                    <Select
                      value={newTransaction.category_id}
                      onValueChange={(value) => {
                        setNewTransaction({...newTransaction, category_id: value});
                        setFormErrors({...formErrors, category_id: false});
                      }}
                    >
                      <SelectTrigger className={cn(
                        "bg-[#1F1F23] border-[#2A2A2E]",
                        formErrors.category_id ? "border-fin-red focus-visible:ring-fin-red" : ""
                      )}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Carregando...</span>
                          </div>
                        ) : categories.length === 0 ? (
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada</p>
                          </div>
                        ) : (
                          categories.map(category => (
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
                    {formErrors.category_id && (
                      <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value" className={formErrors.value ? "text-fin-red" : ""}>Valor *</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className={cn(
                          "bg-[#1F1F23] border-[#2A2A2E]",
                          formErrors.value ? "border-fin-red focus-visible:ring-fin-red" : ""
                        )}
                        value={newTransaction.value}
                        onChange={(e) => {
                          setNewTransaction({...newTransaction, value: e.target.value});
                          if (e.target.value) {
                            setFormErrors({...formErrors, value: false});
                          }
                        }}
                      />
                      {formErrors.value && (
                        <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className={formErrors.date ? "text-fin-red" : ""}>Data do Recebimento *</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-[#1F1F23] border-[#2A2A2E]",
                                !newTransaction.date && "text-muted-foreground",
                                formErrors.date ? "border-fin-red focus-visible:ring-fin-red" : ""
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newTransaction.date ? format(new Date(newTransaction.date), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newTransaction.date ? new Date(newTransaction.date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewTransaction({
                                    ...newTransaction, 
                                    date: format(date, "yyyy-MM-dd")
                                  });
                                  setFormErrors({...formErrors, date: false});
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {formErrors.date && (
                        <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newTransaction.status}
                      onValueChange={(value) => setNewTransaction({...newTransaction, status: value})}
                    >
                      <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                        <SelectValue placeholder="Escolha o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Recebido</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormErrors({});
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-fin-green text-black hover:bg-fin-green/90" 
                  onClick={handleAddTransaction}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center">
                <div className="mr-2 p-2 bg-fin-green/10 rounded">
                  <Check className="h-4 w-4 text-fin-green" />
                </div>
                Recebimentos Confirmados
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalReceived)}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.incomeCount} recebimentos registrados
            </p>
            <div className="mt-4">
              <span className="text-xs font-medium inline-flex items-center">
                <ArrowUp className="h-3 w-3 mr-1 text-fin-green" /> Receita total do período
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center">
                <div className="mr-2 p-2 bg-amber-500/10 rounded">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                Recebimentos Pendentes
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(tx => tx.status === 'pending').length} recebimentos pendentes
            </p>
            <div className="mt-4">
              <span className="text-xs font-medium inline-flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> Valores a receber
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center">
                <div className="mr-2 p-2 bg-blue-500/10 rounded">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                Média Mensal
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.monthlyAverage)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média de receitas dos últimos 6 meses
            </p>
            <div className="mt-4">
              <span className="text-xs font-medium inline-flex items-center">
                <Repeat className="h-3 w-3 mr-1" /> Análise de recorrência
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DateFilter 
            dateRange={dateRange}
            dateFilterMode={dateFilterMode}
            onPrevMonth={() => setDateFilterMode("prev")}
            onNextMonth={() => setDateFilterMode("next")}
            onCurrentMonth={() => setDateFilterMode("current")}
            onDateRangeChange={(range) => {
              setDateRange(range);
              setDateFilterMode("custom");
            }}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar recebimentos..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                Recebidos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("overdue")}>
                Atrasados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="completed">Recebidos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Atrasados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum recebimento encontrado.</p>
                </div>
              ) : (
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
                    {transactions
                      .filter(transaction => {
                        if (activeTab !== "all") {
                          return transaction.status === activeTab;
                        }
                        return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.category}
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <span className="text-fin-green flex items-center">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {transaction.value.toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-right flex justify-end items-center gap-2">
                            {transaction.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-fin-green hover:text-fin-green/80 hover:bg-fin-green/10"
                                onClick={async () => {
                                  try {
                                    if (!user) return;
                                    
                                    const { error } = await supabase
                                      .from('transactions')
                                      .update({
                                        status: 'completed'
                                      })
                                      .eq('id', transaction.id);
                                    
                                    if (error) throw error;
                                    
                                    toast({
                                      title: "Recebimento atualizado",
                                      description: "O recebimento foi marcado como recebido com sucesso.",
                                    });
                                    
                                    fetchTransactions();
                                    calculateDashboardData();
                                  } catch (error: any) {
                                    toast({
                                      title: "Erro ao atualizar recebimento",
                                      description: error.message,
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                title="Marcar como recebido"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsUpdateSheetOpen(true);
                              }}
                              title="Editar recebimento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {/* Similar content as "all" tab but filtered for completed */}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Similar content as "all" tab but filtered for pending */}
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          {/* Similar content as "all" tab but filtered for overdue */}
        </TabsContent>
      </Tabs>
      
      {/* Update Transaction Sheet */}
      <Sheet open={isUpdateSheetOpen && selectedTransaction !== null} onOpenChange={setIsUpdateSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalhes do Recebimento</SheetTitle>
            <SheetDescription>
              Visualize e atualize os detalhes do recebimento.
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  value={selectedTransaction.description}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, description: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={selectedTransaction.category_id || ""}
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedTransaction.value}
                    onChange={(e) => setSelectedTransaction({...selectedTransaction, value: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input
                    type="text"
                    value={selectedTransaction.date}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={selectedTransaction.status}
                  onValueChange={(value) => setSelectedTransaction({...selectedTransaction, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Recebido</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      if (!user || !selectedTransaction) return;
                      
                      const { error } = await supabase
                        .from('transactions')
                        .delete()
                        .eq('id', selectedTransaction.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Recebimento excluído",
                        description: "O recebimento foi excluído com sucesso.",
                      });
                      
                      setIsUpdateSheetOpen(false);
                      fetchTransactions();
                      calculateDashboardData();
                    } catch (error: any) {
                      toast({
                        title: "Erro ao excluir recebimento",
                        description: error.message,
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (!user || !selectedTransaction) return;
                      
                      // Find the category name
                      let categoryName = selectedTransaction.category;
                      if (selectedTransaction.category_id) {
                        const category = categories.find(c => c.id === selectedTransaction.category_id);
                        if (category) {
                          categoryName = category.name;
                        }
                      }
                      
                      const { error } = await supabase
                        .from('transactions')
                        .update({
                          description: selectedTransaction.description,
                          category: categoryName,
                          category_id: selectedTransaction.category_id,
                          value: selectedTransaction.value,
                          status: selectedTransaction.status
                        })
                        .eq('id', selectedTransaction.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Recebimento atualizado",
                        description: "O recebimento foi atualizado com sucesso.",
                      });
                      
                      setIsUpdateSheetOpen(false);
                      fetchTransactions();
                      calculateDashboardData();
                    } catch (error: any) {
                      toast({
                        title: "Erro ao atualizar recebimento",
                        description: error.message,
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Recebimentos;
