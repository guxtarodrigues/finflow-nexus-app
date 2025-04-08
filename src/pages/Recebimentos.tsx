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
  CalendarIcon,
  Check,
  Pencil,
  Inbox,
  Clock
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { DateFilter } from "@/components/payments/DateFilter";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Receipt {
  id: string;
  date: string;
  description: string;
  category: string;
  category_id: string;
  value: number;
  status: string;
  client_id?: string;
  client_name?: string;
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
}

const Recebimentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
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
  
  const [formErrors, setFormErrors] = useState<{
    description?: boolean;
    category_id?: boolean;
    value?: boolean;
    date?: boolean;
    client_id?: boolean;
  }>({});
  
  const [newReceipt, setNewReceipt] = useState({
    description: "",
    category_id: "",
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
    client_id: "",
    status: "pending"
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReceipts();
      fetchCategories();
      fetchClients();
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
        .eq('user_id', user.id)
        .in('type', ['income', 'investment']);
      
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
        .select('id, name')
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

  const fetchReceipts = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order('date', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      if (!transactionsData) {
        setReceipts([]);
        return;
      }
      
      const clientsMap = new Map<string, { id: string, name: string }>();
      
      const transactionsWithClientId = transactionsData.filter(tx => tx.client_id);
      
      if (transactionsWithClientId.length > 0) {
        const clientIds = [...new Set(transactionsWithClientId.map(tx => tx.client_id))];
        
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);
        
        if (clientsError) throw clientsError;
        
        if (clientsData) {
          clientsData.forEach(client => {
            clientsMap.set(client.id, { id: client.id, name: client.name });
          });
        }
      }
      
      const formattedReceipts = transactionsData.map((item) => {
        const client = item.client_id ? clientsMap.get(item.client_id) : null;
        
        return {
          id: item.id,
          date: format(new Date(item.date), 'dd/MM/yyyy'),
          description: item.description,
          category: item.category,
          category_id: item.category_id,
          value: Number(item.value),
          status: item.status,
          client_id: item.client_id,
          client_name: client ? client.name : null
        };
      });
      
      setReceipts(formattedReceipts);
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      toast({
        title: "Erro ao carregar recebimentos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (receipt: typeof newReceipt) => {
    const errors = {
      description: !receipt.description,
      category_id: !receipt.category_id,
      value: !receipt.value,
      date: !receipt.date,
      client_id: !receipt.client_id
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleCreateReceipt = async () => {
    try {
      if (!user) return;
      
      if (!validateForm(newReceipt)) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const selectedCategory = categories.find(cat => cat.id === newReceipt.category_id);
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
          description: newReceipt.description,
          category: selectedCategory.name,
          category_id: newReceipt.category_id,
          type: 'income',
          value: Number(newReceipt.value),
          date: new Date(newReceipt.date).toISOString(),
          status: newReceipt.status,
          user_id: user.id,
          client_id: newReceipt.client_id
        });

      if (error) throw error;
      
      setNewReceipt({
        description: "",
        category_id: "",
        value: "",
        date: format(new Date(), "yyyy-MM-dd"),
        client_id: "",
        status: "pending"
      });
      setIsDialogOpen(false);
      setFormErrors({});
      
      await fetchReceipts();
      
      toast({
        title: "Recebimento criado",
        description: "O recebimento foi registrado com sucesso",
      });
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      toast({
        title: "Erro ao criar recebimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditReceipt = async () => {
    try {
      if (!user || !editingReceipt) return;
      
      const selectedCategory = categories.find(cat => cat.id === editingReceipt.category_id);
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
        .update({
          description: editingReceipt.description,
          category: selectedCategory.name,
          category_id: editingReceipt.category_id,
          value: Number(editingReceipt.value),
          date: new Date(editingReceipt.date).toISOString(),
          status: editingReceipt.status,
          client_id: editingReceipt.client_id
        })
        .eq('id', editingReceipt.id);

      if (error) throw error;
      
      setEditingReceipt(null);
      setIsEditDialogOpen(false);
      
      await fetchReceipts();
      
      toast({
        title: "Recebimento atualizado",
        description: "O recebimento foi atualizado com sucesso",
      });
    } catch (error: any) {
      console.error('Error updating receipt:', error);
      toast({
        title: "Erro ao atualizar recebimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchReceipts();
      
      toast({
        title: "Recebimento excluído",
        description: "O recebimento foi removido com sucesso",
      });
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      toast({
        title: "Erro ao excluir recebimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchReceipts();
      
      toast({
        title: "Status atualizado",
        description: `O recebimento foi marcado como ${newStatus === 'completed' ? 'recebido' : 'pendente'}`,
      });
    } catch (error: any) {
      console.error('Error updating receipt status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (receipt: Receipt) => {
    setEditingReceipt({
      ...receipt,
      date: format(new Date(receipt.date.split('/').reverse().join('-')), 'yyyy-MM-dd'),
    });
    setIsEditDialogOpen(true);
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

  const filteredReceipts = receipts.filter(receipt => 
    receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.client_name && receipt.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recebimentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus recebimentos e receitas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Recebimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
            <DialogHeader>
              <DialogTitle>Novo Recebimento</DialogTitle>
              <DialogDescription>
                Adicione um novo recebimento ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className={formErrors.description ? "text-red-500" : ""}>
                    Descrição*
                  </Label>
                  <Input
                    id="description"
                    placeholder="Ex: Pagamento de cliente, Venda, etc."
                    className={cn(
                      "bg-[#1F1F23] border-[#2A2A2E]",
                      formErrors.description && "border-red-500"
                    )}
                    value={newReceipt.description}
                    onChange={(e) => {
                      setNewReceipt({...newReceipt, description: e.target.value});
                      setFormErrors({...formErrors, description: false});
                    }}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">Descrição é obrigatória</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client" className={formErrors.client_id ? "text-red-500" : ""}>
                    Cliente*
                  </Label>
                  <Select
                    value={newReceipt.client_id}
                    onValueChange={(value) => {
                      setNewReceipt({...newReceipt, client_id: value});
                      setFormErrors({...formErrors, client_id: false});
                    }}
                  >
                    <SelectTrigger className={cn(
                      "bg-[#1F1F23] border-[#2A2A2E]",
                      formErrors.client_id && "border-red-500"
                    )}>
                      <SelectValue placeholder="Selecione um cliente" />
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
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-1 text-fin-green"
                            onClick={() => {
                              setIsDialogOpen(false);
                            }}
                          >
                            Criar cliente
                          </Button>
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
                  {formErrors.client_id && (
                    <p className="text-red-500 text-xs mt-1">Cliente é obrigatório</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className={formErrors.category_id ? "text-red-500" : ""}>
                    Categoria*
                  </Label>
                  <Select
                    value={newReceipt.category_id}
                    onValueChange={(value) => {
                      setNewReceipt({...newReceipt, category_id: value});
                      setFormErrors({...formErrors, category_id: false});
                    }}
                  >
                    <SelectTrigger className={cn(
                      "bg-[#1F1F23] border-[#2A2A2E]",
                      formErrors.category_id && "border-red-500"
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
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-1 text-fin-green" 
                            onClick={() => {
                              setIsDialogOpen(false);
                            }}
                          >
                            Criar categoria
                          </Button>
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
                    <p className="text-red-500 text-xs mt-1">Categoria é obrigatória</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value" className={formErrors.value ? "text-red-500" : ""}>
                      Valor*
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className={cn(
                        "bg-[#1F1F23] border-[#2A2A2E]",
                        formErrors.value && "border-red-500"
                      )}
                      value={newReceipt.value}
                      onChange={(e) => {
                        setNewReceipt({...newReceipt, value: e.target.value});
                        setFormErrors({...formErrors, value: false});
                      }}
                    />
                    {formErrors.value && (
                      <p className="text-red-500 text-xs mt-1">Valor é obrigatório</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className={formErrors.date ? "text-red-500" : ""}>
                      Data*
                    </Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-[#1F1F23] border-[#2A2A2E]",
                              !newReceipt.date && "text-muted-foreground",
                              formErrors.date && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newReceipt.date ? format(new Date(newReceipt.date), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={newReceipt.date ? new Date(newReceipt.date) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setNewReceipt({
                                  ...newReceipt, 
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
                      <p className="text-red-500 text-xs mt-1">Data é obrigatória</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newReceipt.status}
                    onValueChange={(value) => setNewReceipt({...newReceipt, status: value})}
                  >
                    <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Recebido</SelectItem>
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
                onClick={handleCreateReceipt}
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
              <Inbox className="mr-2 h-5 w-5 text-fin-green" />
              Recebimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar recebimentos..."
                    className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
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
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                        Pendentes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                        Recebidos
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                    <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border border-[#2A2A2E]">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-fin-green" />
                  </div>
                ) : filteredReceipts.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Nenhum recebimento encontrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2A2A2E]">
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Data</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Descrição</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Cliente</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Categoria</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Valor</th>
                          <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="text-right p-3 text-xs font-medium text-muted-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReceipts.map((receipt) => (
                          <tr key={receipt.id} className="border-b border-[#2A2A2E] hover:bg-[#1F1F23]/50">
                            <td className="p-3 text-sm">{receipt.date}</td>
                            <td className="p-3 text-sm">{receipt.description}</td>
                            <td className="p-3 text-sm">{receipt.client_name || "-"}</td>
                            <td className="p-3 text-sm">{receipt.category}</td>
                            <td className="p-3 text-sm font-medium text-fin-green">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.value)}
                            </td>
                            <td className="p-3 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(receipt.status)}`}>
                                {getStatusText(receipt.status)}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-right">
                              <div className="flex justify-end gap-2">
                                {receipt.status === 'pending' ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                    onClick={() => handleStatusChange(receipt.id, 'completed')}
                                    title="Marcar como recebido"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                    onClick={() => handleStatusChange(receipt.id, 'pending')}
                                    title="Marcar como pendente"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                                  onClick={() => openEditDialog(receipt)}
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                      title="Excluir"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                      </svg>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir recebimento</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir este recebimento? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-red-600 text-white hover:bg-red-700"
                                        onClick={() => handleDeleteReceipt(receipt.id)}
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
          <DialogHeader>
            <DialogTitle>Editar Recebimento</DialogTitle>
            <DialogDescription>
              Atualize as informações do recebimento.
            </DialogDescription>
          </DialogHeader>
          {editingReceipt && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Input
                    id="edit-description"
                    placeholder="Ex: Pagamento de cliente, Venda, etc."
                    className="bg-[#1F1F23] border-[#2A2A2E]"
                    value={editingReceipt.description}
                    onChange={(e) => setEditingReceipt({...editingReceipt, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Cliente</Label>
                  <Select
                    value={editingReceipt.client_id || ''}
                    onValueChange={(value) => setEditingReceipt({...editingReceipt, client_id: value})}
                  >
                    <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editingReceipt.category_id || ''}
                    onValueChange={(value) => setEditingReceipt({...editingReceipt, category_id: value})}
                  >
                    <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-value">Valor</Label>
                    <Input
                      id="edit-value"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="bg-[#1F1F23] border-[#2A2A2E]"
                      value={editingReceipt.value}
                      onChange={(e) => setEditingReceipt({
                        ...editingReceipt, 
                        value: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Data</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-[#1F1F23] border-[#2A2A2E]"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editingReceipt.date ? format(new Date(editingReceipt.date), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editingReceipt.date ? new Date(editingReceipt.date) : undefined}
                            onSelect={(date) => date && setEditingReceipt({
                              ...editingReceipt, 
                              date: format(date, "yyyy-MM-dd")
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingReceipt.status}
                    onValueChange={(value) => setEditingReceipt({...editingReceipt, status: value})}
                  >
                    <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Recebido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-fin-green text-black hover:bg-fin-green/90" 
              onClick={handleEditReceipt}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recebimentos;
