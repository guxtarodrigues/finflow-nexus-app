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
  ArrowRight,
  LayoutGrid
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
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PaymentCalendarView } from "@/components/payments/PaymentCalendarView";
import { DateFilter } from "@/components/payments/DateFilter";

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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [dateFilterMode, setDateFilterMode] = useState<"current" | "prev" | "next" | "custom">("current");
  
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
  }, [filterStatus, user, dateRange]);

  useEffect(() => {
    switch (dateFilterMode) {
      case "current":
        setDateRange({
          from: startOfMonth(currentDate),
          to: endOfMonth(currentDate)
        });
        break;
      case "prev":
        setDateRange({
          from: startOfMonth(subMonths(currentDate, 1)),
          to: endOfMonth(subMonths(currentDate, 1))
        });
        break;
      case "next":
        setDateRange({
          from: startOfMonth(addMonths(currentDate, 1)),
          to: endOfMonth(addMonths(currentDate, 1))
        });
        break;
    }
  }, [dateFilterMode, currentDate]);

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
      
      const filteredByDate = formattedPayments.filter(payment => {
        const paymentDate = parseISO(payment.due_date.split('/').reverse().join('-'));
        return isWithinInterval(paymentDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      });
      
      setPayments(filteredByDate);
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

  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default Pagamentos;
