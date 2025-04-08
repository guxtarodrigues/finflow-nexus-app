
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
  Loader2
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
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Define the Payment type
interface Payment {
  id: string;
  due_date: string;
  description: string;
  recipient: string;
  value: number;
  status: string;
  payment_method: string;
  recurrence: string;
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

const Pagamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { user } = useAuth();
  
  // New payment form state
  const [newPayment, setNewPayment] = useState({
    description: "",
    recipient: "",
    value: "",
    due_date: "",
    payment_method: "Transferência",
    recurrence: "Mensal",
    status: "pending"
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [filterStatus, user]);

  const fetchPayments = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      // Apply filter if set
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data) {
        setPayments([]);
        return;
      }
      
      // Format the payments data
      const formattedPayments = data.map((item: any) => ({
        id: item.id,
        due_date: format(new Date(item.due_date), 'dd/MM/yyyy'),
        description: item.description,
        recipient: item.recipient,
        value: Number(item.value),
        status: item.status,
        payment_method: item.payment_method,
        recurrence: item.recurrence
      }));
      
      setPayments(formattedPayments);
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

  const handleCreatePayment = async () => {
    try {
      if (!user) return;
      
      if (!newPayment.description || !newPayment.recipient || !newPayment.value || !newPayment.due_date) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('payments')
        .insert([
          {
            description: newPayment.description,
            recipient: newPayment.recipient,
            value: Number(newPayment.value),
            due_date: new Date(newPayment.due_date),
            payment_method: newPayment.payment_method,
            recurrence: newPayment.recurrence,
            status: newPayment.status,
            user_id: user.id
          }
        ]);

      if (error) throw error;
      
      // Reset form and close dialog
      setNewPayment({
        description: "",
        recipient: "",
        value: "",
        due_date: "",
        payment_method: "Transferência",
        recurrence: "Mensal",
        status: "pending"
      });
      setIsDialogOpen(false);
      
      // Refresh payment list
      await fetchPayments();
      
      toast({
        title: "Pagamento agendado",
        description: "O pagamento foi registrado com sucesso",
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro ao criar pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh payment list
      await fetchPayments();
      
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi removido com sucesso",
      });
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Erro ao excluir pagamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => 
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus pagamentos e contas a pagar
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1A1A1E] border-[#2A2A2E] text-white">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>
                Adicione um novo pagamento ao sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient" className="text-right">
                  Destinatário
                </Label>
                <Input
                  id="recipient"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newPayment.recipient}
                  onChange={(e) => setNewPayment({...newPayment, recipient: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Valor
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newPayment.value}
                  onChange={(e) => setNewPayment({...newPayment, value: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">
                  Vencimento
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  className="col-span-3 bg-[#1F1F23] border-[#2A2A2E]"
                  value={newPayment.due_date}
                  onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_method" className="text-right">
                  Método
                </Label>
                <select
                  id="payment_method"
                  className="col-span-3 bg-[#1F1F23] border border-[#2A2A2E] rounded-md h-10 px-3 text-base focus:outline-none"
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                >
                  <option value="Transferência">Transferência</option>
                  <option value="Débito Automático">Débito Automático</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurrence" className="text-right">
                  Recorrência
                </Label>
                <select
                  id="recurrence"
                  className="col-span-3 bg-[#1F1F23] border border-[#2A2A2E] rounded-md h-10 px-3 text-base focus:outline-none"
                  value={newPayment.recurrence}
                  onChange={(e) => setNewPayment({...newPayment, recurrence: e.target.value})}
                >
                  <option value="Único">Único</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="bg-fin-green text-black hover:bg-fin-green/90" 
                onClick={handleCreatePayment}
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
              <CreditCard className="mr-2 h-5 w-5 text-fin-green" />
              Todos os Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pagamentos..."
                    className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
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
                        Pagos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('overdue')}>
                        Atrasados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                    <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border border-[#2A2A2E]">
                <Table>
                  <TableHeader className="bg-[#1F1F23]">
                    <TableRow className="hover:bg-[#2A2A2E] border-[#2A2A2E]">
                      <TableHead className="w-[100px]">Vencimento</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Recorrência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 text-fin-green animate-spin mr-2" />
                            <span>Carregando pagamentos...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Nenhum pagamento encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              {payment.due_date}
                            </div>
                          </TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>{payment.recipient}</TableCell>
                          <TableCell>{payment.recurrence}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {payment.value.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagamentos;
