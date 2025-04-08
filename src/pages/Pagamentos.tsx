
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
  ArrowRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const { user } = useAuth();
  
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
        .insert({
          description: newPayment.description,
          recipient: newPayment.recipient,
          value: Number(newPayment.value),
          due_date: new Date(newPayment.due_date).toISOString(),
          payment_method: newPayment.payment_method,
          recurrence: newPayment.recurrence,
          status: newPayment.status,
          user_id: user.id
        });

      if (error) throw error;
      
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

  const handleUpdatePaymentStatus = async (payment: Payment, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id);

      if (error) throw error;
      
      await fetchPayments();
      setIsUpdateSheetOpen(false);
      
      toast({
        title: "Status atualizado",
        description: `O pagamento foi marcado como ${newStatus === 'completed' ? 'pago' : newStatus === 'pending' ? 'pendente' : 'atrasado'}`,
      });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group payments by recurrence type
  const recurringPayments = filteredPayments.filter(payment => 
    payment.recurrence !== "Único"
  );
  
  const uniquePayments = filteredPayments.filter(payment => 
    payment.recurrence === "Único"
  );

  const getPaymentsToDisplay = () => {
    switch(activeTab) {
      case "recurring":
        return recurringPayments;
      case "unique":
        return uniquePayments;
      default:
        return filteredPayments;
    }
  };

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
              Pagamentos
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
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-[#1F1F23] mb-4">
                  <TabsTrigger value="all">Todos os Pagamentos</TabsTrigger>
                  <TabsTrigger value="recurring">Pagamentos Recorrentes</TabsTrigger>
                  <TabsTrigger value="unique">Pagamentos Únicos</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
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
                        ) : getPaymentsToDisplay().length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                              Nenhum pagamento encontrado.
                            </TableCell>
                          </TableRow>
                        ) : (
                          getPaymentsToDisplay().map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                  {payment.due_date}
                                </div>
                              </TableCell>
                              <TableCell>{payment.description}</TableCell>
                              <TableCell>{payment.recipient}</TableCell>
                              <TableCell>{getRecurrenceBadge(payment.recurrence)}</TableCell>
                              <TableCell>{getStatusBadge(payment.status)}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {payment.value.toLocaleString('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Sheet open={isUpdateSheetOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                                    if (open) {
                                      setSelectedPayment(payment);
                                    }
                                    setIsUpdateSheetOpen(open);
                                  }}>
                                    <SheetTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-fin-green"
                                      >
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    </SheetTrigger>
                                    <SheetContent className="bg-[#1A1A1E] border-[#2A2A2E] text-white">
                                      <SheetHeader>
                                        <SheetTitle>Atualizar Pagamento</SheetTitle>
                                        <SheetDescription>
                                          Atualize o status do pagamento para {payment.description}
                                        </SheetDescription>
                                      </SheetHeader>
                                      <div className="py-6">
                                        <div className="mb-6">
                                          <h3 className="text-lg font-semibold mb-2">Detalhes do Pagamento</h3>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-muted-foreground">Descrição:</div>
                                            <div>{payment.description}</div>
                                            <div className="text-muted-foreground">Destinatário:</div>
                                            <div>{payment.recipient}</div>
                                            <div className="text-muted-foreground">Valor:</div>
                                            <div>{payment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                            <div className="text-muted-foreground">Vencimento:</div>
                                            <div>{payment.due_date}</div>
                                            <div className="text-muted-foreground">Método:</div>
                                            <div>{payment.payment_method}</div>
                                            <div className="text-muted-foreground">Recorrência:</div>
                                            <div>{payment.recurrence}</div>
                                            <div className="text-muted-foreground">Status Atual:</div>
                                            <div>{getStatusBadge(payment.status)}</div>
                                          </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold mb-4">Atualizar Status</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                          <Button 
                                            className="bg-fin-green text-black hover:bg-fin-green/90 justify-start"
                                            onClick={() => handleUpdatePaymentStatus(payment, "completed")}
                                          >
                                            <Check className="mr-2 h-4 w-4" /> Marcar como Pago
                                          </Button>
                                          <Button 
                                            className="bg-amber-500 text-black hover:bg-amber-500/90 justify-start"
                                            onClick={() => handleUpdatePaymentStatus(payment, "pending")}
                                          >
                                            <Clock className="mr-2 h-4 w-4" /> Marcar como Pendente
                                          </Button>
                                          <Button 
                                            className="bg-fin-red text-black hover:bg-fin-red/90 justify-start"
                                            onClick={() => handleUpdatePaymentStatus(payment, "overdue")}
                                          >
                                            <AlertCircle className="mr-2 h-4 w-4" /> Marcar como Atrasado
                                          </Button>
                                        </div>
                                      </div>
                                    </SheetContent>
                                  </Sheet>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleDeletePayment(payment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
              
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagamentos;
