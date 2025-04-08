
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { BlurModal } from "@/components/ui/blur-modal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Client } from "@/types";

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  
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
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setClients(data || []);
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
  
  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setNewClient({
        name: client.name,
        email: client.email || "",
        phone: client.phone || ""
      });
    } else {
      setEditingClient(null);
      setNewClient({
        name: "",
        email: "",
        phone: ""
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSaveClient = async () => {
    try {
      if (!user) return;
      
      if (!newClient.name) {
        toast({
          title: "Campo obrigatório",
          description: "O nome do cliente é obrigatório",
          variant: "destructive"
        });
        return;
      }
      
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            name: newClient.name,
            email: newClient.email || null,
            phone: newClient.phone || null
          })
          .eq('id', editingClient.id);
        
        if (error) throw error;
        
        toast({
          title: "Cliente atualizado",
          description: "O cliente foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            name: newClient.name,
            email: newClient.email || null,
            phone: newClient.phone || null,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso",
        });
      }
      
      setIsModalOpen(false);
      fetchClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro ao salvar cliente",
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
        description: "O cliente foi excluído com sucesso",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e contatos para organizar suas finanças
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal">
            Todos os Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenModal()}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Cliente
              </Button>
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
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(client)}
                        >
                          <Pencil className="h-4 w-4" />
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
        </CardContent>
      </Card>
      
      <BlurModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingClient ? "Edite os dados do cliente" : "Preencha os campos para criar um novo cliente"}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center">
                <User className="h-4 w-4 mr-2" /> Nome
              </Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-2" /> Telefone
              </Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="border-white/20"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveClient}>
              {editingClient ? "Salvar alterações" : "Criar cliente"}
            </Button>
          </div>
        </div>
      </BlurModal>
    </div>
  );
};

export default Clientes;
