import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Loader2,
  Mail,
  Phone,
  Calendar,
  CircleDollarSign,
  Info,
  XCircle,
  CheckCircle,
  ArrowUp,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Client, NewClient } from "@/types/clients";
import { ClientTransactionsList } from "@/components/clients/ClientTransactionsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCard } from "@/components/clients/ClientCard";
import { MetricCard } from "@/components/dashboard/MetricCard";

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [paidClients, setPaidClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "monthly">("all");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newClient, setNewClient] = useState<Omit<NewClient, 'user_id'>>({
    name: "",
    email: "",
    phone: "",
    contract_start: null,
    contract_end: null,
    monthly_value: 0,
    status: "active",
    recurring_payment: false,
    description: "",
    payment_status: "pending"
  });
  
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchClients();
      fetchPaidClientsThisMonth();
    }
  }, [user]);
  
  const fetchClients = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
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
      setLoading(false);
    }
  };
  
  const fetchPaidClientsThisMonth = async () => {
    try {
      if (!user) return;
      
      const now = new Date();
      const startDate = startOfMonth(now).toISOString();
      const endDate = endOfMonth(now).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('client_id')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('client_id', 'is', null);
      
      if (error) throw error;
      
      if (data) {
        const paidClientIds = data.map(transaction => transaction.client_id).filter(Boolean);
        setPaidClients(paidClientIds);
      }
    } catch (error: any) {
      console.error('Error fetching paid clients:', error);
    }
  };
  
  const handleCreateClient = async () => {
    try {
      if (!user) return;
      
      if (!newClient.name) {
        toast({
          title: "Nome obrigatório",
          description: "Preencha o nome do cliente",
          variant: "destructive"
        });
        return;
      }
      
      const clientData: NewClient = {
        ...newClient,
        user_id: user.id,
        payment_status: 'pending'
      };
      
      const { data: clientResult, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();
      
      if (clientError) throw clientError;
      
      if (newClient.recurring_payment && newClient.monthly_value && newClient.monthly_value > 0) {
        const currentDate = new Date();
        const transactionData = {
          user_id: user.id,
          client_id: clientResult.id,
          description: `Mensalidade - ${newClient.name}`,
          category: 'Receita de Cliente',
          type: 'income',
          value: newClient.monthly_value,
          date: currentDate.toISOString(),
          due_date: currentDate.toISOString(),
          status: 'pending',
          recurrence: newClient.contract_end ? 'monthly' : 'once'
        };
        
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactionData);
        
        if (transactionError) {
          console.error('Error creating initial transaction:', transactionError);
          toast({
            title: "Cliente criado, mas houve um erro ao criar o recebimento",
            description: transactionError.message,
            variant: "destructive"
          });
        }
      }
      
      setNewClient({
        name: "",
        email: "",
        phone: "",
        contract_start: null,
        contract_end: null,
        monthly_value: 0,
        status: "active",
        recurring_payment: false,
        description: "",
        payment_status: "pending"
      });
      
      setIsDialogOpen(false);
      toast({
        title: "Cliente criado",
        description: "O cliente foi criado com sucesso"
      });
      
      fetchClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso"
      });
      
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateClient = async () => {
    try {
      if (!selectedClient) return;
      
      const { error } = await supabase
        .from('clients')
        .update({
          name: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          contract_start: selectedClient.contract_start,
          contract_end: selectedClient.contract_end,
          monthly_value: selectedClient.monthly_value,
          status: selectedClient.status,
          recurring_payment: selectedClient.recurring_payment,
          description: selectedClient.description,
          payment_status: selectedClient.payment_status
        })
        .eq('id', selectedClient.id);
      
      if (error) throw error;
      
      setIsEditSheetOpen(false);
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso"
      });
      
      fetchClients();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00";
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };
  
  const handleStatusChange = () => {
    fetchClients();
    fetchPaidClientsThisMonth();
  };
  
  const getFilteredClients = () => {
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm))
    );
    
    if (viewMode === "monthly") {
      const activeClients = filtered.filter(client => client.status === 'active' && client.monthly_value);
      const paidThisMonth = activeClients.filter(client => paidClients.includes(client.id));
      const pendingThisMonth = activeClients.filter(client => !paidClients.includes(client.id));
      
      return [...paidThisMonth, ...pendingThisMonth];
    }
    
    return filtered;
  };
  
  const filteredClients = getFilteredClients();
  
  const monthlyRevenue = clients
    .filter(client => client.status === 'active')
    .reduce((sum, client) => sum + (client.monthly_value || 0), 0);
  
  const yearlyRevenue = monthlyRevenue * 12;
  
  const activeClientsCount = clients.filter(client => client.status === 'active').length;
  
  const paidClientsThisMonth = filteredClients.filter(client => 
    client.status === 'active' && paidClients.includes(client.id)
  ).length;
  
  const pendingClientsThisMonth = filteredClients.filter(client => 
    client.status === 'active' && !paidClients.includes(client.id)
  ).length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerenciamento de clientes e contratos
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Receita Mensal"
          value={formatCurrency(monthlyRevenue)}
          subtitle="de clientes ativos"
          icon="income"
        />
        
        <MetricCard
          title="Receita Anual"
          value={formatCurrency(yearlyRevenue)}
          subtitle="projeção para 12 meses"
          icon="savings"
        />
        
        <MetricCard
          title="Clientes Ativos"
          value={activeClientsCount.toString()}
          subtitle="com contratos em vigor"
          icon="money"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal flex items-center">
            <Users className="mr-2 h-5 w-5 text-fin-green" />
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setViewMode(value as "all" | "monthly")}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList className="mb-2 sm:mb-0">
                  <TabsTrigger value="all">Todos os Clientes</TabsTrigger>
                  <TabsTrigger value="monthly">Balanço Mensal</TabsTrigger>
                </TabsList>
                
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar clientes..."
                    className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                      <ClientCard 
                        key={client.id}
                        client={client}
                        onEdit={(client) => {
                          setSelectedClient(client);
                          setIsEditSheetOpen(true);
                        }}
                        onDelete={handleDeleteClient}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-0">
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-[#1F1F23] border-[#2A2A2E]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-normal flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-fin-green" />
                        Clientes Pagos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{paidClientsThisMonth}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1F1F23] border-[#2A2A2E]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-normal flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                        Clientes Pendentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pendingClientsThisMonth}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
                  </div>
                ) : (
                  <>
                    {paidClientsThisMonth > 0 && (
                      <>
                        <h3 className="text-md font-medium mb-3 flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-fin-green" />
                          Pagamentos Recebidos este Mês
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          {filteredClients
                            .filter(client => client.status === 'active' && paidClients.includes(client.id))
                            .map((client) => (
                              <ClientCard 
                                key={client.id}
                                client={client}
                                onEdit={(client) => {
                                  setSelectedClient(client);
                                  setIsEditSheetOpen(true);
                                }}
                                onDelete={handleDeleteClient}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                        </div>
                      </>
                    )}
                    
                    {pendingClientsThisMonth > 0 && (
                      <>
                        <h3 className="text-md font-medium mb-3 flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-amber-500" />
                          Pagamentos Pendentes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredClients
                            .filter(client => client.status === 'active' && !paidClients.includes(client.id))
                            .map((client) => (
                              <ClientCard 
                                key={client.id}
                                client={client}
                                onEdit={(client) => {
                                  setSelectedClient(client);
                                  setIsEditSheetOpen(true);
                                }}
                                onDelete={handleDeleteClient}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1A1A1E] border-[#2A2A2E] text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha as informações do cliente para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                className="bg-[#1F1F23] border-[#2A2A2E]"
                placeholder="Nome completo ou razão social"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  placeholder="email@empresa.com"
                  value={newClient.email || ""}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value || null})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  placeholder="(00) 00000-0000"
                  value={newClient.phone || ""}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value || null})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contract_start">Início do Contrato</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#1F1F23] border-[#2A2A2E] w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newClient.contract_start ? (
                        format(new Date(newClient.contract_start), 'dd/MM/yyyy')
                      ) : (
                        <span className="text-muted-foreground">Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1F1F23] border-[#2A2A2E]">
                    <CalendarComponent
                      mode="single"
                      selected={newClient.contract_start ? new Date(newClient.contract_start) : undefined}
                      onSelect={(date) => {
                        setNewClient({...newClient, contract_start: date ? date.toISOString() : null});
                        setStartDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contract_end">Fim do Contrato</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#1F1F23] border-[#2A2A2E] w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newClient.contract_end ? (
                        format(new Date(newClient.contract_end), 'dd/MM/yyyy')
                      ) : (
                        <span className="text-muted-foreground">Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1F1F23] border-[#2A2A2E]">
                    <CalendarComponent
                      mode="single"
                      selected={newClient.contract_end ? new Date(newClient.contract_end) : undefined}
                      onSelect={(date) => {
                        setNewClient({...newClient, contract_end: date ? date.toISOString() : null});
                        setEndDateOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthly_value">Valor Mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="monthly_value"
                    type="number"
                    className="bg-[#1F1F23] border-[#2A2A2E] pl-9"
                    value={newClient.monthly_value || ""}
                    onChange={(e) => setNewClient({...newClient, monthly_value: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newClient.status}
                  onValueChange={(value: 'active' | 'inactive') => setNewClient({...newClient, status: value})}
                >
                  <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F1F23] border-[#2A2A2E]">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring_payment"
                checked={newClient.recurring_payment}
                onCheckedChange={(checked) => setNewClient({...newClient, recurring_payment: checked})}
              />
              <Label htmlFor="recurring_payment">Pagamento Recorrente</Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                className="bg-[#1F1F23] border-[#2A2A2E] min-h-[100px]"
                placeholder="Detalhes adicionais sobre o cliente ou contrato"
                value={newClient.description || ""}
                onChange={(e) => setNewClient({...newClient, description: e.target.value || null})}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-[#1F1F23] border-[#2A2A2E]">
                Cancelar
              </Button>
            </DialogClose>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleCreateClient}>
              Adicionar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Sheet open={isEditSheetOpen && selectedClient !== null} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Cliente</SheetTitle>
            <SheetDescription>
              Atualize os dados do cliente selecionado.
            </SheetDescription>
          </SheetHeader>
          {selectedClient && (
            <div className="py-4 space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="transactions">Transações</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Cliente</Label>
                    <Input
                      id="edit-name"
                      value={selectedClient.name}
                      onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={selectedClient.email || ""}
                        onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value || null})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-phone">Telefone</Label>
                      <Input
                        id="edit-phone"
                        value={selectedClient.phone || ""}
                        onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value || null})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-contract_start">Início do Contrato</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedClient.contract_start ? (
                              format(new Date(selectedClient.contract_start), 'dd/MM/yyyy')
                            ) : (
                              <span className="text-muted-foreground">Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={selectedClient.contract_start ? new Date(selectedClient.contract_start) : undefined}
                            onSelect={(date) => setSelectedClient({...selectedClient, contract_start: date ? date.toISOString() : null})}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-contract_end">Fim do Contrato</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedClient.contract_end ? (
                              format(new Date(selectedClient.contract_end), 'dd/MM/yyyy')
                            ) : (
                              <span className="text-muted-foreground">Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={selectedClient.contract_end ? new Date(selectedClient.contract_end) : undefined}
                            onSelect={(date) => setSelectedClient({...selectedClient, contract_end: date ? date.toISOString() : null})}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-monthly_value">Valor Mensal</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">R$</span>
                        <Input
                          id="edit-monthly_value"
                          type="number"
                          className="pl-9"
                          value={selectedClient.monthly_value || ""}
                          onChange={(e) => setSelectedClient({...selectedClient, monthly_value: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={selectedClient.status || "active"}
                        onValueChange={(value: 'active' | 'inactive') => 
                          setSelectedClient({...selectedClient, status: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-recurring_payment"
                        checked={selectedClient.recurring_payment}
                        onCheckedChange={(checked) => setSelectedClient({...selectedClient, recurring_payment: checked})}
                      />
                      <Label htmlFor="edit-recurring_payment">Pagamento Recorrente</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-payment_status">Status de Pagamento</Label>
                      <Select
                        value={selectedClient.payment_status || "pending"}
                        onValueChange={(value: 'pending' | 'paid') => 
                          setSelectedClient({...selectedClient, payment_status: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      className="min-h-[100px]"
                      value={selectedClient.description || ""}
                      onChange={(e) => setSelectedClient({...selectedClient, description: e.target.value || null})}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleUpdateClient}>
                      Salvar alterações
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="transactions" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recebimentos do Cliente</h3>
                    <ClientTransactionsList clientId={selectedClient.id} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Clientes;
