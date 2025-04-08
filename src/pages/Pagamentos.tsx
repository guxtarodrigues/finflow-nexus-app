
import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  CalendarRange, 
  Clock, 
  MoreHorizontal, 
  PlusCircle, 
  Search 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

const FormSchema = z.object({
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres" }),
  date: z.date(),
  dueDate: z.date().optional(),
  value: z.coerce.number().positive({ message: "O valor deve ser positivo" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  status: z.string().min(1, { message: "Selecione um status" }),
  paymentMethod: z.string().min(1, { message: "Selecione um método de pagamento" }),
  recipient: z.string().min(3, { message: "O destinatário deve ter pelo menos 3 caracteres" }),
  recurrence: z.string().default("once"),
});

const Pagamentos = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      date: new Date(),
      dueDate: new Date(),
      value: 0,
      category: "",
      status: "pending",
      paymentMethod: "pix",
      recipient: "",
      recurrence: "once",
    },
  });

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "expense");
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPayments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .order("date", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search) {
        query = query.ilike("description", `%${search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (values) => {
    if (!user) return;
    
    try {
      const { description, date, dueDate, value, category, status, paymentMethod, recipient, recurrence } = values;
      
      const newPayment = {
        user_id: user.id,
        description,
        date: format(date, "yyyy-MM-dd"),
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        value,
        category,
        type: "expense",
        status,
        payment_method: paymentMethod,
        recipient,
        recurrence,
      };
      
      const { error } = await supabase
        .from("transactions")
        .insert(newPayment);
        
      if (error) throw error;
      
      toast({
        title: "Pagamento adicionado",
        description: "O pagamento foi adicionado com sucesso",
      });
      
      setOpen(false);
      form.reset();
      fetchPayments();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso",
      });
      
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Erro ao excluir pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchPayments();
    }
  }, [user, statusFilter, search]);

  const onStatusChange = () => {
    fetchPayments();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pagamento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do pagamento abaixo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddPayment)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição do pagamento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinatário</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do destinatário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Pagamento</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="completed">Pago</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="overdue">Atrasado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                            <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                            <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                            <SelectItem value="cash">Dinheiro</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurrence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recorrência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="once">Única</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar Pagamento</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pagamentos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            Gerencie todos os seus pagamentos em um só lugar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={payments} 
            loading={loading} 
            onDeleteTransaction={handleDeletePayment} 
            onStatusChange={onStatusChange}
            showStatusActions={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Pagamentos;
