import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Users, Package } from "lucide-react";
import { Client } from "@/types/clients";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";

const Clientes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          products:product_id(name, price)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure status values are properly typed
      const typedClients = (data || []).map(client => ({
        ...client,
        status: client.status === 'prospect' ? 'prospect' : 
                client.status === 'inactive' ? 'inactive' : 'active'
      })) as Client[];
      
      setClients(typedClients);
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Cliente excluído com sucesso!",
        description: "O cliente foi removido da sua lista."
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const handleStatusChange = async (clientId: string, newStatus: 'active' | 'inactive' | 'prospect') => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Status atualizado com sucesso!",
        description: "O status do cliente foi alterado."
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error updating client status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeClients = clients.filter(client => client.status === 'active');
  const recurringClients = clients.filter(client => client.recurring_payment);
  const monthlyRecurringRevenue = recurringClients.reduce((sum, client) => sum + (client.monthly_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e vincule-os aos seus produtos
          </p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Recorrentes</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringClients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recorrente</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyRecurringRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pesquisar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-muted-foreground">Carregando clientes...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm ? "Tente alterar os termos de pesquisa." : "Comece adicionando seu primeiro cliente."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      )}

      <ClientFormDialog
        client={editingClient}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={fetchClients}
      />
    </div>
  );
};

export default Clientes;
