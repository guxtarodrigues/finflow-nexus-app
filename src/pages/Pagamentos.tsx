
import { useState, useEffect } from "react";
import { 
  CreditCard, 
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PaymentCalendarView } from "@/components/payments/PaymentCalendarView";
import { DateFilter } from "@/components/payments/DateFilter";
import { StatusSelect } from "@/components/payments/StatusSelect";
import { CurrencyInput } from "@/components/ui/currency-input";
import { BlurModal } from "@/components/ui/blur-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, Client } from "@/types";

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
  client_id?: string;
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
  const [loading, setLoading] = useState(true);
  const [isPaymentModal, setIsPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
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
    value: 0,
    due_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "Transferência",
    recurrence: "Mensal",
    status: "pending",
    category_id: "",
    client_id: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPayments();
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
        category_id: item.category_id,
        client_id: item.client_id
      }));
      
      const filteredByDate = formattedPayments.filter(payment => {
        const paymentDate = parseISO(payment.due_date.split('/').reverse().join('-'));
        return isWithinInterval(paymentDate, {
          start: dateRange.from,
          end: dateRange.to
        });
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

  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchClients = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return "-";
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "-";
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "-";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "-";
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return "#6E59A5";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#6E59A5";
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
          <Button 
            className="w-full sm:w-auto" 
            onClick={() => {
              setNewPayment({
                description: "",
                recipient: "",
                value: 0,
                due_date: format(new Date(), "yyyy-MM-dd"),
                payment_method: "Transferência",
                recurrence: "Mensal",
                status: "pending",
                category_id: "",
                client_id: ""
              });
              setIsPaymentModal(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar
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
              placeholder="Buscar pagamentos..."
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
                Pagos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("overdue")}>
                Atrasados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            className="aspect-square p-2"
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            title={viewMode === "list" ? "Visualizar como calendário" : "Visualizar como lista"}
          >
            {viewMode === "list" ? <CalendarDays className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          <TabsTrigger value="completed">Pagos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {viewMode === "list" ? (
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recorrência</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments
                        .filter(payment => {
                          if (activeTab !== "all") {
                            return payment.status === activeTab;
                          }
                          return payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 payment.recipient.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map(payment => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.description}</TableCell>
                            <TableCell>{payment.recipient}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {payment.category_id && (
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: getCategoryColor(payment.category_id) }}
                                  />
                                )}
                                {getCategoryName(payment.category_id)}
                              </div>
                            </TableCell>
                            <TableCell>{getClientName(payment.client_id)}</TableCell>
                            <TableCell>{payment.due_date}</TableCell>
                            <TableCell>
                              {payment.value.toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>{getRecurrenceBadge(payment.recurrence)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsUpdateSheetOpen(true);
                                }}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <PaymentCalendarView 
              payments={payments.filter(payment => {
                if (activeTab !== "all") {
                  return payment.status === activeTab;
                }
                return payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       payment.recipient.toLowerCase().includes(searchTerm.toLowerCase());
              })} 
              currentDate={currentDate} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {/* Similar content as "all" tab but filtered for pending */}
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          {/* Similar content as "all" tab but filtered for overdue */}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {/* Similar content as "all" tab but filtered for completed */}
        </TabsContent>
      </Tabs>
      
      {/* Add Payment Modal */}
      <BlurModal open={isPaymentModal} onOpenChange={setIsPaymentModal}>
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">Adicionar Pagamento</h2>
            <p className="text-sm text-muted-foreground">
              Adicione um novo pagamento para controlar suas finanças
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recipient">Destinatário</Label>
                <Input
                  id="recipient"
                  value={newPayment.recipient}
                  onChange={(e) => setNewPayment({...newPayment, recipient: e.target.value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Categoria
                </Label>
                <Select
                  value={newPayment.category_id}
                  onValueChange={(value) => setNewPayment({...newPayment, category_id: value})}
                >
                  <SelectTrigger id="category" className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
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
                <Label htmlFor="client" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Cliente
                </Label>
                <Select
                  value={newPayment.client_id}
                  onValueChange={(value) => setNewPayment({...newPayment, client_id: value})}
                >
                  <SelectTrigger id="client" className="bg-white/10 border-white/20">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Valor</Label>
                <CurrencyInput
                  id="value"
                  value={newPayment.value}
                  onValueChange={(value) => setNewPayment({...newPayment, value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newPayment.due_date}
                  onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payment_method">Método de Pagamento</Label>
                <Select
                  value={newPayment.payment_method}
                  onValueChange={(value) => setNewPayment({...newPayment, payment_method: value})}
                >
                  <SelectTrigger id="payment_method" className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recurrence">Recorrência</Label>
                <Select
                  value={newPayment.recurrence}
                  onValueChange={(value) => setNewPayment({...newPayment, recurrence: value})}
                >
                  <SelectTrigger id="recurrence" className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Selecione a recorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Único">Único</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <StatusSelect 
              status={newPayment.status} 
              onChange={(status) => setNewPayment({...newPayment, status})}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentModal(false)}
              className="border-white/20"
            >
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                try {
                  if (!user) return;
                  
                  if (!newPayment.description || !newPayment.recipient || !newPayment.due_date) {
                    toast({
                      title: "Campos obrigatórios",
                      description: "Preencha todos os campos para continuar.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  const { error } = await supabase
                    .from('payments')
                    .insert({
                      user_id: user.id,
                      description: newPayment.description,
                      recipient: newPayment.recipient,
                      value: newPayment.value,
                      due_date: newPayment.due_date,
                      payment_method: newPayment.payment_method,
                      recurrence: newPayment.recurrence,
                      status: newPayment.status,
                      category_id: newPayment.category_id || null,
                      client_id: newPayment.client_id || null
                    });
                  
                  if (error) throw error;
                  
                  toast({
                    title: "Pagamento adicionado",
                    description: "O pagamento foi adicionado com sucesso.",
                  });
                  
                  setIsPaymentModal(false);
                  fetchPayments();
                } catch (error: any) {
                  console.error('Error adding payment:', error);
                  toast({
                    title: "Erro ao adicionar pagamento",
                    description: error.message,
                    variant: "destructive"
                  });
                }
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </BlurModal>
      
      {/* Update Payment Sheet */}
      <Sheet open={isUpdateSheetOpen && selectedPayment !== null} onOpenChange={setIsUpdateSheetOpen}>
        <SheetContent className="sm:max-w-md bg-black/40 backdrop-blur-[45px] border-l border-white/10">
          <SheetHeader>
            <SheetTitle>Detalhes do Pagamento</SheetTitle>
            <SheetDescription>
              Visualize e atualize os detalhes do pagamento.
            </SheetDescription>
          </SheetHeader>
          {selectedPayment && (
            <div className="space-y-6 py-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={selectedPayment.description}
                    onChange={(e) => setSelectedPayment({...selectedPayment, description: e.target.value})}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Destinatário</Label>
                  <Input
                    value={selectedPayment.recipient}
                    onChange={(e) => setSelectedPayment({...selectedPayment, recipient: e.target.value})}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Categoria
                  </Label>
                  <Select
                    value={selectedPayment.category_id || ""}
                    onValueChange={(value) => setSelectedPayment({...selectedPayment, category_id: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
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
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Cliente
                  </Label>
                  <Select
                    value={selectedPayment.client_id || ""}
                    onValueChange={(value) => setSelectedPayment({...selectedPayment, client_id: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
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
                
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <CurrencyInput
                    value={selectedPayment.value}
                    onValueChange={(value) => setSelectedPayment({...selectedPayment, value})}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="text"
                    value={selectedPayment.due_date}
                    readOnly
                    className="bg-white/10 border-white/20"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={selectedPayment.payment_method}
                    onValueChange={(value) => setSelectedPayment({...selectedPayment, payment_method: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Recorrência</Label>
                  <Select
                    value={selectedPayment.recurrence}
                    onValueChange={(value) => setSelectedPayment({...selectedPayment, recurrence: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Único">Único</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <StatusSelect 
                  status={selectedPayment.status} 
                  onChange={(status) => setSelectedPayment({...selectedPayment, status})}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      if (!user || !selectedPayment) return;
                      
                      const { error } = await supabase
                        .from('payments')
                        .delete()
                        .eq('id', selectedPayment.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Pagamento excluído",
                        description: "O pagamento foi excluído com sucesso.",
                      });
                      
                      setIsUpdateSheetOpen(false);
                      fetchPayments();
                    } catch (error: any) {
                      toast({
                        title: "Erro ao excluir pagamento",
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
                      if (!user || !selectedPayment) return;
                      
                      // Get the previous status to check if it was changed to completed
                      const { data: previousData } = await supabase
                        .from('payments')
                        .select('status')
                        .eq('id', selectedPayment.id)
                        .single();
                      
                      // Update the payment
                      const { error } = await supabase
                        .from('payments')
                        .update({
                          description: selectedPayment.description,
                          recipient: selectedPayment.recipient,
                          value: selectedPayment.value,
                          status: selectedPayment.status,
                          payment_method: selectedPayment.payment_method,
                          recurrence: selectedPayment.recurrence,
                          category_id: selectedPayment.category_id || null,
                          client_id: selectedPayment.client_id || null
                        })
                        .eq('id', selectedPayment.id);
                      
                      if (error) throw error;
                      
                      // If the status was changed to completed, create a transaction
                      if (previousData && previousData.status !== 'completed' && selectedPayment.status === 'completed') {
                        const { error: transactionError } = await supabase
                          .from('transactions')
                          .insert({
                            user_id: user.id,
                            description: `Pagamento: ${selectedPayment.description}`,
                            category: selectedPayment.category_id || 'Pagamentos',
                            value: selectedPayment.value,
                            type: 'expense',
                            date: new Date().toISOString(),
                            status: 'completed'
                          });
                        
                        if (transactionError) throw transactionError;
                      }
                      
                      toast({
                        title: "Pagamento atualizado",
                        description: "O pagamento foi atualizado com sucesso.",
                      });
                      
                      setIsUpdateSheetOpen(false);
                      fetchPayments();
                    } catch (error: any) {
                      toast({
                        title: "Erro ao atualizar pagamento",
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

export default Pagamentos;
