import { useState, useEffect } from "react";
import { 
  CreditCard, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2,
  CalendarDays,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Repeat,
  Banknote,
  ArrowRight,
  LayoutGrid,
  Users,
  Calendar,
  CalendarIcon,
  Tag,
  RefreshCw,
  DollarSign,
  CalendarCheck,
  Edit,
  CheckCircle
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
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO, isWithinInterval, parse } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PaymentCalendarView } from "@/components/payments/PaymentCalendarView";
import { DateFilter } from "@/components/payments/DateFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  due_date: string;
  description: string;
  recipient: string;
  value: number;
  status: string;
  payment_method: string;
  recurrence: string;
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
          <Check className="mr-1 h-3 w-3" /> Pago
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

const getRecurrenceBadge = (recurrence: string) => {
  switch (recurrence) {
    case "Mensal":
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-0">
          <Repeat className="mr-1 h-3 w-3" /> Mensal
        </Badge>
      );
    case "Trimestral":
      return (
        <Badge variant="outline" className="bg-violet-500/20 text-violet-500 border-0">
          <Repeat className="mr-1 h-3 w-3" /> Trimestral
        </Badge>
      );
    case "Anual":
      return (
        <Badge variant="outline" className="bg-indigo-500/20 text-indigo-500 border-0">
          <Repeat className="mr-1 h-3 w-3" /> Anual
        </Badge>
      );
    case "Único":
      return (
        <Badge variant="outline" className="bg-gray-500/20 text-gray-500 border-0">
          <Banknote className="mr-1 h-3 w-3" /> Único
        </Badge>
      );
    default:
      return null;
  }
};

const Pagamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [dashboardData, setDashboardData] = useState({
    totalPending: 0,
    totalPaid: 0,
    totalOverdue: 0,
    totalRecurring: 0,
    upcomingPayments: 0,
    monthlyRecurringAmount: 0
  });
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
  
  const [newPayment, setNewPayment] = useState({
    description: "",
    recipient: "",
    client_id: "",
    category_id: "",
    value: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "Transferência",
    recurrence: "Mensal",
    status: "pending"
  });
  
  const [formErrors, setFormErrors] = useState<{
    description?: boolean;
    recipient?: boolean;
    value?: boolean;
    due_date?: boolean;
  }>({});
  
  const { toast } = useToast();

  // Updated state for the edit payment form
  const [editPayment, setEditPayment] = useState({
    id: "",
    description: "",
    recipient: "",
    client_id: "",
    category_id: "",
    value: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "Transferência",
    recurrence: "Mensal",
    status: "pending"
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
      fetchCategories();
      fetchClients();
      calculateDashboardData();
    }
  }, [filterStatus, user, dateRange]);

  useEffect(() => {
    switch (dateFilterMode) {
      case "current":
        setCurrentDate(new Date());
        break;
      case "prev":
        setCurrentDate(prevDate => subMonths(prevDate, 1));
        break;
      case "next":
        setCurrentDate(prevDate => addMonths(prevDate, 1));
        break;
    }
  }, [dateFilterMode]);

  useEffect(() => {
    if (dateFilterMode !== "custom") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      setDateRange({
        from: monthStart,
        to: monthEnd
      });
    }
  }, [currentDate, dateFilterMode]);

  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      setLoadingCategories(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');
      
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

  const fetchPayments = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data) {
        setPayments([]);
        return;
      }
      
      const formattedPayments = data.map((item) => ({
        id: item.id,
        due_date: format(new Date(item.due_date), 'dd/MM/yyyy'),
        description: item.description,
        recipient: item.recipient,
        value: Number(item.value),
        status: item.status,
        payment_method: item.payment_method,
        recurrence: item.recurrence,
        category_id: item.category_id
      }));
      
      const filteredByDate = formattedPayments.filter(payment => {
        try {
          const paymentDate = parseISO(payment.due_date.split('/').reverse().join('-'));
          return isWithinInterval(paymentDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        } catch (error) {
          return false;
        }
      });
      
      setPayments(filteredByDate);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Erro ao carregar pagamentos",
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

      const { data: allPayments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!allPayments) return;

      const pendingPayments = allPayments.filter(payment => payment.status === 'pending');
      const paidPayments = allPayments.filter(payment => payment.status === 'completed');
      const overduePayments = allPayments.filter(payment => payment.status === 'overdue');
      const recurringPayments = allPayments.filter(payment => 
        payment.recurrence === 'Mensal' || 
        payment.recurrence === 'Trimestral' || 
        payment.recurrence === 'Anual'
      );

      const totalPending = pendingPayments.reduce((sum, payment) => sum + Number(payment.value), 0);
      const totalPaid = paidPayments.reduce((sum, payment) => sum + Number(payment.value), 0);
      const totalOverdue = overduePayments.reduce((sum, payment) => sum + Number(payment.value), 0);
      
      const monthlyRecurring = recurringPayments
        .filter(payment => payment.recurrence === 'Mensal')
        .reduce((sum, payment) => sum + Number(payment.value), 0);
      
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingPayments = pendingPayments.filter(payment => {
        const paymentDate = new Date(payment.due_date);
        return paymentDate >= today && paymentDate <= nextWeek;
      }).length;

      setDashboardData({
        totalPending,
        totalPaid,
        totalOverdue,
        totalRecurring: recurringPayments.length,
        upcomingPayments,
        monthlyRecurringAmount: monthlyRecurring
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
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setNewPayment({
        ...newPayment,
        client_id: clientId,
        recipient: selectedClient.name
      });
    } else {
      setNewPayment({
        ...newPayment,
        client_id: clientId
      });
    }
  };
  
  const handleEditClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setEditPayment({
        ...editPayment,
        client_id: clientId,
        recipient: selectedClient.name
      });
    } else {
      setEditPayment({
        ...editPayment,
        client_id: clientId
      });
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!user) return;
      
      const errors: {
        description?: boolean;
        recipient?: boolean;
        value?: boolean;
        due_date?: boolean;
      } = {};
      
      if (!newPayment.description) errors.description = true;
      if (!newPayment.recipient) errors.recipient = true;
      if (!newPayment.value) errors.value = true;
      if (!newPayment.due_date) errors.due_date = true;
      
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
      
      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          description: newPayment.description,
          recipient: newPayment.recipient,
          client_id: newPayment.client_id || null,
          category_id: newPayment.category_id || null,
          value: parseFloat(newPayment.value),
          due_date: newPayment.due_date,
          payment_method: newPayment.payment_method,
          recurrence: newPayment.recurrence,
          status: newPayment.status
        });
      
      if (error) throw error;
      
      toast({
        title: "Pagamento adicionado",
        description: "O pagamento foi adicionado com sucesso.",
      });
      
      setNewPayment({
        description: "",
        recipient: "",
        client_id: "",
        category_id: "",
        value: "",
        due_date: format(new Date(), "yyyy-MM-dd"),
        payment_method: "Transferência",
        recurrence: "Mensal",
        status: "pending"
      });
      
      setIsDialogOpen(false);
      fetchPayments();
      calculateDashboardData();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleUpdatePayment = async () => {
    try {
      if (!user) return;
      
      const errors: {
        description?: boolean;
        recipient?: boolean;
        value?: boolean;
        due_date?: boolean;
      } = {};
      
      if (!editPayment.description) errors.description = true;
      if (!editPayment.recipient) errors.recipient = true;
      if (!editPayment.value) errors.value = true;
      if (!editPayment.due_date) errors.due_date = true;
      
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
      
      const { error } = await supabase
        .from('payments')
        .update({
          description: editPayment.description,
          recipient: editPayment.recipient,
          client_id: editPayment.client_id || null,
          category_id: editPayment.category_id || null,
          value: parseFloat(editPayment.value.toString()),
          due_date: editPayment.due_date,
          payment_method: editPayment.payment_method,
          recurrence: editPayment.recurrence,
          status: editPayment.status
        })
        .eq('id', editPayment.id);
      
      if (error) throw error;
      
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi atualizado com sucesso.",
      });
      
      setIsUpdateSheetOpen(false);
      fetchPayments();
      calculateDashboardData();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      if (!user) return;
      
      const { data: previousData } = await supabase
        .from('payments')
        .select('status, description, category_id, value')
        .eq('id', paymentId)
        .single();
      
      if (!previousData) {
        toast({
          title: "Erro",
          description: "Pagamento não encontrado",
          variant: "destructive"
        });
        return;
      }
      
      if (previousData.status === 'completed') {
        toast({
          title: "Informação",
          description: "Este pagamento já está marcado como pago",
        });
        return;
      }
      
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed'
        })
        .eq('id', paymentId);
      
      if (error) throw error;
      
      let categoryData = null;
      if (previousData.category_id) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('id', previousData.category_id)
          .single();
        
        categoryData = data;
      }
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: `Pagamento: ${previousData.description}`,
          category: categoryData ? categoryData.name : 'Pagamentos',
          category_id: previousData.category_id,
          value: previousData.value,
          type: 'expense',
          date: new Date().toISOString(),
          status: 'completed'
        });
      
      if (transactionError) throw transactionError;
      
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi marcado como pago com sucesso.",
      });
      
      fetchPayments();
      calculateDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pagamento",
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
  
  const openEditSheet = (payment: Payment) => {
    // Convert the payment format to the edit form format
    setEditPayment({
      id: payment.id,
      description: payment.description,
      recipient: payment.recipient,
      client_id: "", // We'll need to find the client ID if available
      category_id: payment.category_id || "",
      value: payment.value.toString(),
      due_date: format(parse(payment.due_date, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
      payment_method: payment.payment_method,
      recurrence: payment.recurrence,
      status: payment.status
    });
    
    setIsUpdateSheetOpen(true);
  };

  // New handler for date range changes
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setDateFilterMode("custom");
  };

  // Handler for going to previous month
  const handlePrevMonth = () => {
    setDateFilterMode("prev");
  };

  // Handler for going to next month
  const handleNextMonth = () => {
    setDateFilterMode("next");
  };

  // Handler for returning to current month
  const handleCurrentMonth = () => {
    setDateFilterMode("current");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus pagamentos e contas a pagar.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-fin-green text-black hover:bg-fin-green/90">
                <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
              <DialogHeader>
                <DialogTitle>Novo Pagamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo pagamento para controlar suas finanças.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className={formErrors.description ? "text-fin-red" : ""}>Descrição *</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Aluguel, Conta de luz, etc."
                      className={cn(
                        "bg-[#1F1F23] border-[#2A2A2E]",
                        formErrors.description ? "border-fin-red focus-visible:ring-fin-red" : ""
                      )}
                      value={newPayment.description}
                      onChange={(e) => {
                        setNewPayment({...newPayment, description: e.target.value});
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
                    <Label className={cn(
                      "flex items-center gap-1",
                      formErrors.recipient ? "text-fin-red" : ""
                    )}>
                      <Users className="h-4 w-4" /> Destinatário *
                    </Label>
                    <Select
                      value={newPayment.client_id}
                      onValueChange={handleClientChange}
                    >
                      <SelectTrigger className={cn(
                    "bg-[#1F1F23] border-[#2A2A2E]",
                    formErrors.recipient ? "border-fin-red focus-visible:ring-fin-red" : ""
                  )}>
                        <SelectValue placeholder="Selecione um cliente ou digite manualmente" />
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
                    {!newPayment.client_id && (
                      <Input
                        className={cn(
                          "mt-2 bg-[#1F1F23] border-[#2A2A2E]",
                          formErrors.recipient ? "border-fin-red focus-visible:ring-fin-red" : ""
                        )}
                        placeholder="Ou digite o nome do destinatário"
                        value={newPayment.recipient}
                        onChange={(e) => {
                          setNewPayment({...newPayment, recipient: e.target.value});
                          if (e.target.value) {
                            setFormErrors({...formErrors, recipient: false});
                          }
                        }}
                      />
                    )}
                    {formErrors.recipient && (
                      <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="h-4 w-4" /> Categoria
                    </Label>
                    <Select
                      value={newPayment.category_id}
                      onValueChange={(value) => setNewPayment({...newPayment, category_id: value})}
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
                        value={newPayment.value}
                        onChange={(e) => {
                          setNewPayment({...newPayment, value: e.target.value});
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
                      <Label htmlFor="due_date" className={formErrors.due_date ? "text-fin-red" : ""}>Data de Vencimento *</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-[#1F1F23] border-[#2A2A2E]",
                                !newPayment.due_date && "text-muted-foreground",
                                formErrors.due_date ? "border-fin-red focus-visible:ring-fin-red" : ""
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newPayment.due_date ? format(new Date(newPayment.due_date), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={newPayment.due_date ? new Date(newPayment.due_date) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewPayment({
                                    ...newPayment, 
                                    due_date: format(date, "yyyy-MM-dd")
                                  });
                                  setFormErrors({...formErrors, due_date: false});
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {formErrors.due_date && (
                        <p className="text-fin-red text-xs">Este campo é obrigatório</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Método de Pagamento</Label>
                      <Select
                        value={newPayment.payment_method}
                        onValueChange={(value) => setNewPayment({...newPayment, payment_method: value})}
                      >
                        <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectValue placeholder="Escolha o método de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurrence">Recorrência</Label>
                      <Select
                        value={newPayment.recurrence}
                        onValueChange={(value) => setNewPayment({...newPayment, recurrence: value})}
                      >
                        <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectValue placeholder="Escolha a recorrência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Único">Único</SelectItem>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Trimestral">Trimestral</SelectItem>
                          <SelectItem value="Anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
