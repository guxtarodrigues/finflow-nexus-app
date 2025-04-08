
import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Mail,
  Phone,
  Calendar,
  CircleDollarSign,
  Info,
  XCircle,
  CheckCircle
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
  SheetTitle
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Client, NewClient } from "@/types/clients";

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [totalClients, setTotalClients] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New client form state
  const [newClient, setNewClient] = useState<Omit<NewClient, 'user_id'>>({
    name: "",
    email: "",
    phone: "",
    contract_start: null,
    contract_end: null,
    monthly_value: 0,
    status: "active",
    recurring_payment: false,
    description: ""
  });
  
  // Date picker states
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchClients();
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
        setTotalClients(data.length);
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
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('clients')
        .insert(clientData);
      
      if (error) throw error;
      
      setNewClient({
        name: "",
        email: "",
        phone: "",
        contract_start: null,
        contract_end: null,
        monthly_value: 0,
        status: "active",
        recurring_payment: false,
        description: ""
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
          description: selectedClient.description
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
  
  const getStatusColor = (status: string | null) => {
    if (status === 'active') return "text-green-500";
    if (status === 'inactive') return "text-red-500";
    return "text-gray-500";
  };
  
  const getStatusIcon = (status: string | null) => {
    if (status === 'active') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'inactive') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );
  
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalClients}</div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  clients
                    .filter(client => client.status === 'active')
                    .reduce((sum, client) => sum + (client.monthly_value || 0), 0)
                )}
              </div>
              <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Clientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {clients.filter(client => client.status === 'active').length}
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal flex items-center">
            <Users className="mr-2 h-5 w-5 text-fin-green" />
            Todos os Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
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
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Valor Mensal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.contract_start ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(client.contract_start), 'dd/MM/yyyy')}
                            {client.contract_end && ` até ${format(new Date(client.contract_end), 'dd/MM/yyyy')}`}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.monthly_value ? (
                          <div className="flex items-center gap-1">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            {formatCurrency(client.monthly_value)}
                            {client.recurring_payment && <span className="text-xs text-fin-green ml-1">(Recorrente)</span>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getStatusColor(client.status)}`}>
                          {getStatusIcon(client.status)}
                          <span>{client.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsEditSheetOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Create Client Dialog */}
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
      
      {/* Edit Client Sheet */}
      <Sheet open={isEditSheetOpen && selectedClient !== null} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Cliente</SheetTitle>
            <SheetDescription>
              Atualize os dados do cliente selecionado.
            </SheetDescription>
          </SheetHeader>
          {selectedClient && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Cliente</Label>
                <Input
                  id="edit-name"
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedClient.email || ""}
                    onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value || null})}
                  />
                </div>
                <div className="space-y-2">
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
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-recurring_payment"
                  checked={selectedClient.recurring_payment}
                  onCheckedChange={(checked) => setSelectedClient({...selectedClient, recurring_payment: checked})}
                />
                <Label htmlFor="edit-recurring_payment">Pagamento Recorrente</Label>
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Clientes;
