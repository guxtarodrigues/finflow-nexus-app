
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
  ChevronDown,
  Filter,
  ArrowUpDown,
  CreditCard
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
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
      
      const { error } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          email: newClient.email || null,
          phone: newClient.phone || null,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setNewClient({
        name: "",
        email: "",
        phone: ""
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
          phone: selectedClient.phone
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
            Gerenciamento de clientes e destinatários de pagamentos
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
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        {client.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {client.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
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
        <DialogContent className="sm:max-w-[425px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Adicione um novo cliente ou destinatário para pagamentos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="bg-[#1F1F23] border-[#2A2A2E]"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-[#1F1F23] border-[#2A2A2E]"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                className="bg-[#1F1F23] border-[#2A2A2E]"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleCreateClient}>
              Salvar
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
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                />
              </div>
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
