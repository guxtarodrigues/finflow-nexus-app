
import { useState } from "react";
import { 
  ArrowLeftRight, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  Trash2 
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

// Mock data for transactions
const transactionsData = [
  {
    id: 1,
    date: "12/04/2025",
    description: "Pagamento Cliente XYZ",
    category: "Receita",
    type: "income",
    value: 2500.00,
    status: "completed"
  },
  {
    id: 2,
    date: "10/04/2025",
    description: "Aluguel Escritório",
    category: "Despesa Fixa",
    type: "expense",
    value: 1200.00,
    status: "completed"
  },
  {
    id: 3,
    date: "08/04/2025",
    description: "Assinatura Software",
    category: "Serviços",
    type: "expense",
    value: 99.90,
    status: "completed"
  },
  {
    id: 4,
    date: "05/04/2025",
    description: "Consultoria Cliente ABC",
    category: "Receita",
    type: "income",
    value: 1800.00,
    status: "completed"
  },
  {
    id: 5,
    date: "01/04/2025",
    description: "Internet e Telefone",
    category: "Utilidades",
    type: "expense",
    value: 189.90,
    status: "completed"
  },
  {
    id: 6,
    date: "28/03/2025",
    description: "Material de Escritório",
    category: "Suprimentos",
    type: "expense",
    value: 75.50,
    status: "completed"
  },
];

const Movimentacoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
          <p className="text-muted-foreground">
            Gerenciamento de receitas e despesas
          </p>
        </div>
        <Button className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
        </Button>
      </div>

      <div className="flex flex-col space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-normal flex items-center">
              <ArrowLeftRight className="mr-2 h-5 w-5 text-fin-green" />
              Todas as Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar movimentações..."
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
                      <DropdownMenuItem>Todas</DropdownMenuItem>
                      <DropdownMenuItem>Receitas</DropdownMenuItem>
                      <DropdownMenuItem>Despesas</DropdownMenuItem>
                      <DropdownMenuItem>Este mês</DropdownMenuItem>
                      <DropdownMenuItem>Últimos 3 meses</DropdownMenuItem>
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
                      <TableHead className="w-[100px]">Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-[#1F1F23] border-[#2A2A2E]">
                        <TableCell className="font-medium">{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "income" ? "success" : "destructive"} className="bg-opacity-20 text-xs">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          transaction.type === "income" ? "text-fin-green" : "text-fin-red"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"} 
                          {transaction.value.toLocaleString('pt-BR', { 
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

export default Movimentacoes;
