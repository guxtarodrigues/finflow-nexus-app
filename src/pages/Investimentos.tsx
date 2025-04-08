
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, TrendingUp, Calendar, DollarSign, PercentIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlurModal } from "@/components/ui/blur-modal";
import { CurrencyInput } from "@/components/ui/currency-input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Investment } from "@/types";

const Investimentos = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    amount: 0,
    return_rate: 0,
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    status: "active" as "active" | "completed" | "cancelled"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);
  
  const fetchInvestments = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      setInvestments(data || []);
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      toast({
        title: "Erro ao carregar investimentos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (investment?: Investment) => {
    if (investment) {
      setEditingInvestment(investment);
      setNewInvestment({
        name: investment.name,
        amount: investment.amount,
        return_rate: investment.return_rate,
        start_date: format(new Date(investment.start_date), "yyyy-MM-dd"),
        end_date: investment.end_date ? format(new Date(investment.end_date), "yyyy-MM-dd") : "",
        status: investment.status
      });
    } else {
      setEditingInvestment(null);
      setNewInvestment({
        name: "",
        amount: 0,
        return_rate: 0,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        status: "active"
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSaveInvestment = async () => {
    try {
      if (!user) return;
      
      if (!newInvestment.name || !newInvestment.start_date) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      if (editingInvestment) {
        const { error } = await supabase
          .from('investments')
          .update({
            name: newInvestment.name,
            amount: newInvestment.amount,
            return_rate: newInvestment.return_rate,
            start_date: newInvestment.start_date,
            end_date: newInvestment.end_date || null,
            status: newInvestment.status
          })
          .eq('id', editingInvestment.id);
        
        if (error) throw error;
        
        toast({
          title: "Investimento atualizado",
          description: "O investimento foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('investments')
          .insert({
            name: newInvestment.name,
            amount: newInvestment.amount,
            return_rate: newInvestment.return_rate,
            start_date: newInvestment.start_date,
            end_date: newInvestment.end_date || null,
            status: newInvestment.status,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Investimento criado",
          description: "O investimento foi criado com sucesso",
        });
      }
      
      setIsModalOpen(false);
      fetchInvestments();
    } catch (error: any) {
      console.error('Error saving investment:', error);
      toast({
        title: "Erro ao salvar investimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Investimento excluído",
        description: "O investimento foi excluído com sucesso",
      });
      
      fetchInvestments();
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Erro ao excluir investimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-0">
            Ativo
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-0">
            Concluído
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-0">
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus investimentos e acompanhe seu rendimento
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Investimento
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal">
            Todos os Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum investimento encontrado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenModal()}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Investimento
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Taxa de Retorno</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Término</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.name}</TableCell>
                    <TableCell>
                      {investment.amount.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </TableCell>
                    <TableCell>{investment.return_rate}% ao ano</TableCell>
                    <TableCell>{format(new Date(investment.start_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {investment.end_date 
                        ? format(new Date(investment.end_date), 'dd/MM/yyyy')
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(investment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(investment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvestment(investment.id)}
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
              {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingInvestment ? "Edite os dados do investimento" : "Preencha os campos para criar um novo investimento"}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" /> Nome do Investimento
              </Label>
              <Input
                id="name"
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" /> Valor Investido
              </Label>
              <CurrencyInput
                id="amount"
                value={newInvestment.amount}
                onValueChange={(value) => setNewInvestment({...newInvestment, amount: value})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="return_rate" className="flex items-center">
                <PercentIcon className="h-4 w-4 mr-2" /> Taxa de Retorno (% ao ano)
              </Label>
              <Input
                id="return_rate"
                type="number"
                step="0.01"
                value={newInvestment.return_rate}
                onChange={(e) => setNewInvestment({...newInvestment, return_rate: parseFloat(e.target.value)})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Data de Início
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newInvestment.start_date}
                  onChange={(e) => setNewInvestment({...newInvestment, start_date: e.target.value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="end_date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Data de Término (opcional)
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newInvestment.end_date}
                  onChange={(e) => setNewInvestment({...newInvestment, end_date: e.target.value})}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newInvestment.status}
                onValueChange={(value: "active" | "completed" | "cancelled") => 
                  setNewInvestment({...newInvestment, status: value})
                }
              >
                <SelectTrigger id="status" className="bg-white/10 border-white/20">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSaveInvestment}>
              {editingInvestment ? "Salvar alterações" : "Criar investimento"}
            </Button>
          </div>
        </div>
      </BlurModal>
    </div>
  );
};

export default Investimentos;
