
import { useState } from "react";
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
  AlertCircle
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

// Mock data for payments
const paymentsData = [
  {
    id: 1,
    dueDate: "15/04/2025",
    description: "Aluguel Escritório",
    recipient: "Imobiliária Silva",
    value: 1200.00,
    status: "pending",
    paymentMethod: "Transferência",
    recurrence: "Mensal"
  },
  {
    id: 2,
    dueDate: "17/04/2025",
    description: "Internet Empresarial",
    recipient: "Telecom Brasil",
    value: 189.90,
    status: "pending",
    paymentMethod: "Débito Automático",
    recurrence: "Mensal"
  },
  {
    id: 3,
    dueDate: "20/04/2025",
    description: "Serviço de Contabilidade",
    recipient: "Contabil Express",
    value: 450.00,
    status: "pending",
    paymentMethod: "Transferência",
    recurrence: "Mensal"
  },
  {
    id: 4,
    dueDate: "05/04/2025",
    description: "Assinatura Software ERP",
    recipient: "Cloud Solutions",
    value: 99.90,
    status: "completed",
    paymentMethod: "Cartão de Crédito",
    recurrence: "Mensal"
  },
  {
    id: 5,
    dueDate: "02/04/2025",
    description: "Impostos Municipais",
    recipient: "Prefeitura",
    value: 780.45,
    status: "completed",
    paymentMethod: "Transferência",
    recurrence: "Trimestral"
  },
  {
    id: 6,
    dueDate: "10/04/2025",
    description: "Seguro Empresarial",
    recipient: "Seguradora Confiança",
    value: 350.00,
    status: "overdue",
    paymentMethod: "Boleto",
    recurrence: "Anual"
  },
];

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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus pagamentos e contas a pagar
          </p>
        </div>
        <Button className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
        </Button>
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
                      <DropdownMenuItem>Todos</DropdownMenuItem>
                      <DropdownMenuItem>Pendentes</DropdownMenuItem>
                      <DropdownMenuItem>Pagos</DropdownMenuItem>
                      <DropdownMenuItem>Atrasados</DropdownMenuItem>
                      <DropdownMenuItem>Este mês</DropdownMenuItem>
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
                    {paymentsData.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            {payment.dueDate}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
