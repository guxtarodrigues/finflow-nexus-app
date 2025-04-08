
import { useState, useEffect } from "react";
import { 
  CircleDollarSign, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  ChevronDown,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Calendar
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
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";

interface Investment {
  id: string;
  name: string;
  amount: number;
  return_rate: number;
  start_date: string;
  end_date: string | null;
  status: "active" | "completed" | "cancelled";
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Investimentos = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [activeInvestments, setActiveInvestments] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New investment form state
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    amount: "",
    return_rate: "",
    start_date: "",
    end_date: "",
    status: "active" as "active" | "completed" | "cancelled"
  });
  
  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user, filterStatus]);
  
  const fetchInvestments = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        // Cast the data to the Investment type
        const typedData = data as Investment[];
        setInvestments(typedData);
        
        // Calculate total investment amount and count active investments
        let total = 0;
        let active = 0;
        
        typedData.forEach(investment => {
          total += investment.amount;
          if (investment.status === 'active') {
            active++;
          }
        });
        
        setTotalInvestment(total);
        setActiveInvestments(active);
      }
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
  
  const handleCreateInvestment = async () => {
    try {
      if (!user) return;
      
      if (!newInvestment.name || !newInvestment.amount || !newInvestment.return_rate || !newInvestment.start_date) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('investments')
        .insert({
          name: newInvestment.name,
          amount: parseFloat(newInvestment.amount),
          return_rate: parseFloat(newInvestment.return_rate),
          start_date: newInvestment.start_date,
          end_date: newInvestment.end_date || null,
          status: newInvestment.status,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setNewInvestment({
        name: "",
        amount: "",
        return_rate: "",
        start_date: "",
        end_date: "",
        status: "active"
      });
      
      setIsDialogOpen(false);
      toast({
        title: "Investimento criado",
        description: "O investimento foi criado com sucesso"
      });
      
      fetchInvestments();
    } catch (error: any) {
      console.error('Error creating investment:', error);
      toast({
        title: "Erro ao criar investimento",
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
        description: "O investimento foi excluído com sucesso"
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
  
  const handleUpdateInvestment = async () => {
    try {
      if (!selectedInvestment) return;
      
      const { error } = await supabase
        .from('investments')
        .update({
          name: selectedInvestment.name,
          amount: selectedInvestment.amount,
          return_rate: selectedInvestment.return_rate,
          status: selectedInvestment.status,
          end_date: selectedInvestment.end_date
        })
        .eq('id', selectedInvestment.id);
      
      if (error) throw error;
      
      setIsEditSheetOpen(false);
      toast({
        title: "Investimento atualizado",
        description: "O investimento foi atualizado com sucesso"
      });
      
      fetchInvestments();
    } catch (error: any) {
      console.error('Error updating investment:', error);
      toast({
        title: "Erro ao atualizar investimento",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-0">
            Ativo
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-0">
            Concluído
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-0">
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  const filteredInvestments = investments.filter(investment => 
    investment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de investimentos e aplicações financeiras
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Investimento
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {totalInvestment.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </div>
              <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Investimentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activeInvestments}</div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal flex items-center">
            <CircleDollarSign className="mr-2 h-5 w-5 text-fin-green" />
            Todos os Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar investimentos..."
                  className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                    <Filter className="mr-2 h-4 w-4" /> Filtrar
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Ativos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                    Concluídos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    Cancelados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum investimento encontrado.</p>
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
                  {filteredInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell className="font-medium">{investment.name}</TableCell>
                      <TableCell>
                        {investment.amount.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </TableCell>
                      <TableCell>{investment.return_rate}%</TableCell>
                      <TableCell>{formatDate(investment.start_date)}</TableCell>
                      <TableCell>{investment.end_date ? formatDate(investment.end_date) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(investment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvestment(investment);
                              setIsEditSheetOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>
      
      {/* Create Investment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
          <DialogHeader>
            <DialogTitle>Novo Investimento</DialogTitle>
            <DialogDescription>
              Adicione um novo investimento ou aplicação financeira.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                className="bg-[#1F1F23] border-[#2A2A2E]"
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  value={newInvestment.amount}
                  onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return_rate">Taxa de Retorno (%)</Label>
                <Input
                  id="return_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  value={newInvestment.return_rate}
                  onChange={(e) => setNewInvestment({...newInvestment, return_rate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  value={newInvestment.start_date}
                  onChange={(e) => setNewInvestment({...newInvestment, start_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  className="bg-[#1F1F23] border-[#2A2A2E]"
                  value={newInvestment.end_date}
                  onChange={(e) => setNewInvestment({...newInvestment, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newInvestment.status} 
                onValueChange={(value) => setNewInvestment({...newInvestment, status: value as "active" | "completed" | "cancelled"})}
              >
                <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleCreateInvestment}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Investment Sheet */}
      <Sheet open={isEditSheetOpen && selectedInvestment !== null} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Investimento</SheetTitle>
            <SheetDescription>
              Atualize os dados do investimento selecionado.
            </SheetDescription>
          </SheetHeader>
          {selectedInvestment && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedInvestment.name}
                  onChange={(e) => setSelectedInvestment({...selectedInvestment, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Valor</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedInvestment.amount}
                    onChange={(e) => setSelectedInvestment({...selectedInvestment, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-return_rate">Taxa de Retorno (%)</Label>
                  <Input
                    id="edit-return_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedInvestment.return_rate}
                    onChange={(e) => setSelectedInvestment({...selectedInvestment, return_rate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_date">Data de Término</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={selectedInvestment.end_date || ""}
                  onChange={(e) => setSelectedInvestment({...selectedInvestment, end_date: e.target.value || null})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedInvestment.status} 
                  onValueChange={(value) => setSelectedInvestment({...selectedInvestment, status: value as "active" | "completed" | "cancelled"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleUpdateInvestment}>
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

export default Investimentos;
