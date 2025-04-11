
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileBarChart, FileText, Download, Filter, Table, FileSpreadsheet, Calendar, ArrowRight, Coins, TrendingUp, Settings, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const Relatorios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customReportOpen, setCustomReportOpen] = useState(false);
  const [customColumns, setCustomColumns] = useState<{id: string, label: string, selected: boolean}[]>([
    {id: 'date', label: 'Data', selected: true},
    {id: 'description', label: 'Descrição', selected: true},
    {id: 'value', label: 'Valor', selected: true},
    {id: 'type', label: 'Tipo', selected: true},
    {id: 'category', label: 'Categoria', selected: true},
    {id: 'status', label: 'Status', selected: true},
    {id: 'recipient', label: 'Destinatário/Origem', selected: false},
    {id: 'payment_method', label: 'Método de Pagamento', selected: false},
  ]);
  
  const form = useForm({
    defaultValues: {
      reportType: 'transactions',
      dateRange: 'month',
      filterIncomes: true,
      filterExpenses: true,
      startDate: '',
      endDate: '',
    }
  });

  // Generate Monthly Report
  const generateMonthlyReport = async () => {
    if (!user) return;
    
    setActiveReportId('monthly');
    setLoading(true);
    
    try {
      const now = new Date();
      const startDate = startOfMonth(now).toISOString();
      const endDate = endOfMonth(now).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setReportData(data || []);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório mensal gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating monthly report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Quarterly Report
  const generateQuarterlyReport = async () => {
    if (!user) return;
    
    setActiveReportId('quarterly');
    setLoading(true);
    
    try {
      const now = new Date();
      const threeMonthsAgo = subMonths(now, 3);
      const startDate = startOfMonth(threeMonthsAgo).toISOString();
      const endDate = endOfMonth(now).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setReportData(data || []);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório trimestral gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating quarterly report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Annual Report
  const generateAnnualReport = async () => {
    if (!user) return;
    
    setActiveReportId('annual');
    setLoading(true);
    
    try {
      const now = new Date();
      const oneYearAgo = subMonths(now, 12);
      const startDate = startOfMonth(oneYearAgo).toISOString();
      const endDate = endOfMonth(now).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setReportData(data || []);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório anual gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating annual report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Client Report
  const generateClientReport = async () => {
    if (!user) return;
    
    setActiveReportId('clients');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      setReportData(data || []);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório de clientes gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating client report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Category Report
  const generateCategoryReport = async () => {
    if (!user) return;
    
    setActiveReportId('categories');
    setLoading(true);
    
    try {
      // Fetch transactions from the last 3 months
      const now = new Date();
      const threeMonthsAgo = subMonths(now, 3);
      const startDate = startOfMonth(threeMonthsAgo).toISOString();
      const endDate = endOfMonth(now).toISOString();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) throw error;
      
      // Group by category and calculate totals
      const categories: Record<string, {total: number, count: number, type: string}> = {};
      
      (data || []).forEach(transaction => {
        const category = transaction.category;
        if (!categories[category]) {
          categories[category] = {
            total: 0,
            count: 0,
            type: transaction.type
          };
        }
        
        categories[category].total += transaction.value;
        categories[category].count += 1;
      });
      
      // Convert to array for display
      const categoryData = Object.entries(categories).map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        type: data.type,
        average: data.total / data.count
      }));
      
      setReportData(categoryData);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório de categorias gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating category report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Custom Report
  const generateCustomReport = async (formData: any) => {
    if (!user) return;
    
    setActiveReportId('custom');
    setLoading(true);
    setCustomReportOpen(false);
    
    try {
      let startDate, endDate;
      
      // Calculate date range based on selection
      const now = new Date();
      
      if (formData.dateRange === 'month') {
        startDate = startOfMonth(now).toISOString();
        endDate = endOfMonth(now).toISOString();
      } else if (formData.dateRange === 'quarter') {
        startDate = startOfMonth(subMonths(now, 3)).toISOString();
        endDate = endOfMonth(now).toISOString();
      } else if (formData.dateRange === 'year') {
        startDate = startOfMonth(subMonths(now, 12)).toISOString();
        endDate = endOfMonth(now).toISOString();
      } else if (formData.dateRange === 'custom') {
        startDate = formData.startDate;
        endDate = formData.endDate;
      }
      
      // Build query
      let query = supabase
        .from(formData.reportType)
        .select('*')
        .eq('user_id', user.id);
      
      // Add date filters if applicable
      if (['transactions', 'payments'].includes(formData.reportType)) {
        query = query
          .gte('date', startDate)
          .lte('date', endDate);
          
        // Add type filters for transactions
        if (formData.reportType === 'transactions') {
          const types = [];
          if (formData.filterIncomes) types.push('income');
          if (formData.filterExpenses) types.push('expense');
          
          if (types.length === 1) {
            query = query.eq('type', types[0]);
          } else if (types.length === 0) {
            throw new Error("Selecione pelo menos um tipo de transação");
          }
        }
      }
      
      // Execute query
      const { data, error } = await query.order(
        formData.reportType === 'clients' ? 'name' : 'date',
        { ascending: formData.reportType === 'clients' }
      );
      
      if (error) throw error;
      
      setReportData(data || []);
      
      toast({
        title: "Relatório gerado",
        description: "Relatório personalizado gerado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating custom report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!reportData.length) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Gere um relatório primeiro",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get visible columns for this report type
      let visibleColumns: string[] = [];
      let filename = 'relatorio';
      
      if (activeReportId === 'custom') {
        visibleColumns = customColumns.filter(col => col.selected).map(col => col.id);
        filename = 'relatorio-personalizado';
      } else if (activeReportId === 'clients') {
        visibleColumns = ['name', 'email', 'phone', 'monthly_value', 'status'];
        filename = 'relatorio-clientes';
      } else if (activeReportId === 'categories') {
        visibleColumns = ['name', 'type', 'total', 'count', 'average'];
        filename = 'relatorio-categorias';
      } else {
        visibleColumns = ['date', 'description', 'type', 'category', 'value', 'status'];
        
        if (activeReportId === 'monthly') filename = 'relatorio-mensal';
        else if (activeReportId === 'quarterly') filename = 'relatorio-trimestral';
        else if (activeReportId === 'annual') filename = 'relatorio-anual';
      }
      
      // Create CSV header
      const headerMapping: {[key: string]: string} = {
        name: 'Nome',
        email: 'Email', 
        phone: 'Telefone',
        monthly_value: 'Valor Mensal',
        status: 'Status',
        date: 'Data',
        description: 'Descrição',
        type: 'Tipo',
        category: 'Categoria',
        value: 'Valor',
        recipient: 'Destinatário/Origem',
        payment_method: 'Método de Pagamento',
        total: 'Total',
        count: 'Quantidade',
        average: 'Média'
      };
      
      const header = visibleColumns.map(col => headerMapping[col] || col).join(',');
      
      // Create CSV rows
      const rows = reportData.map(item => {
        return visibleColumns.map(col => {
          let value = item[col];
          
          // Format values
          if (col === 'date' && value) {
            value = format(parseISO(value), 'dd/MM/yyyy');
          } else if (['value', 'total', 'average', 'monthly_value'].includes(col) && typeof value === 'number') {
            // Strip currency symbol and special chars for CSV
            value = value.toFixed(2).replace('.', ',');
          } else if (col === 'type') {
            value = value === 'income' ? 'Receita' : value === 'expense' ? 'Despesa' : value;
          } else if (col === 'status') {
            const statusMap: {[key: string]: string} = {
              'completed': 'Concluído',
              'pending': 'Pendente',
              'canceled': 'Cancelado',
              'active': 'Ativo',
              'inactive': 'Inativo'
            };
            value = statusMap[value] || value;
          }
          
          // Escape CSV special characters
          if (typeof value === 'string') {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
          }
          
          return value === null || value === undefined ? '' : value;
        }).join(',');
      });
      
      // Combine header and rows
      const csvContent = [header, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório exportado",
        description: "O arquivo CSV foi baixado com sucesso"
      });
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast({
        title: "Erro ao exportar relatório",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Render report content based on active report ID
  const renderReportContent = () => {
    if (!activeReportId) {
      return (
        <div className="text-center p-8 text-[#94949F]">
          Selecione um relatório para visualizar os dados
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 text-fin-green animate-spin mb-4" />
          <p className="text-[#94949F]">Gerando relatório...</p>
        </div>
      );
    }
    
    if (!reportData.length) {
      return (
        <div className="text-center p-8 text-[#94949F]">
          Nenhum dado encontrado para o período selecionado
        </div>
      );
    }
    
    // Clients report
    if (activeReportId === 'clients') {
      return (
        <UITable>
          <TableHeader>
            <TableRow className="hover:bg-[#2A2A2E]">
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((client, index) => (
              <TableRow key={index} className="hover:bg-[#2A2A2E]">
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.phone || '-'}</TableCell>
                <TableCell>
                  {client.monthly_value ? formatCurrency(client.monthly_value) : '-'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'active' ? 'bg-fin-green/20 text-fin-green' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      );
    }
    
    // Categories report
    if (activeReportId === 'categories') {
      return (
        <UITable>
          <TableHeader>
            <TableRow className="hover:bg-[#2A2A2E]">
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Média</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((category, index) => (
              <TableRow key={index} className="hover:bg-[#2A2A2E]">
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    category.type === 'income' ? 'bg-fin-green/20 text-fin-green' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {category.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(category.total)}</TableCell>
                <TableCell>{category.count}</TableCell>
                <TableCell>{formatCurrency(category.average)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      );
    }
    
    // Transactions reports (monthly, quarterly, annual, custom)
    return (
      <UITable>
        <TableHeader>
          <TableRow className="hover:bg-[#2A2A2E]">
            {activeReportId === 'custom' ? (
              <>
                {customColumns.filter(col => col.selected).map(column => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
              </>
            ) : (
              <>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((transaction, index) => (
            <TableRow key={index} className="hover:bg-[#2A2A2E]">
              {activeReportId === 'custom' ? (
                <>
                  {customColumns.filter(col => col.selected).map(column => (
                    <TableCell key={column.id}>
                      {renderCellValue(transaction, column.id)}
                    </TableCell>
                  ))}
                </>
              ) : (
                <>
                  <TableCell>
                    {transaction.date ? format(parseISO(transaction.date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'income' ? 'bg-fin-green/20 text-fin-green' : 
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={transaction.type === 'income' ? 'text-fin-green' : 'text-red-500'}>
                    {formatCurrency(transaction.value)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed' ? 'bg-fin-green/20 text-fin-green' : 
                      transaction.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {transaction.status === 'completed' ? 'Concluído' : 
                       transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </span>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </UITable>
    );
  };
  
  // Helper function to render cell values with proper formatting
  const renderCellValue = (transaction: any, columnId: string) => {
    const value = transaction[columnId];
    
    if (columnId === 'date' && value) {
      return format(parseISO(value), 'dd/MM/yyyy');
    }
    
    if (['value', 'monthly_value'].includes(columnId) && typeof value === 'number') {
      return formatCurrency(value);
    }
    
    if (columnId === 'type') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'income' ? 'bg-fin-green/20 text-fin-green' : 
          'bg-red-500/20 text-red-500'
        }`}>
          {value === 'income' ? 'Receita' : 'Despesa'}
        </span>
      );
    }
    
    if (columnId === 'status') {
      const statusColors: {[key: string]: string} = {
        'completed': 'bg-fin-green/20 text-fin-green',
        'pending': 'bg-amber-500/20 text-amber-500',
        'canceled': 'bg-red-500/20 text-red-500',
        'active': 'bg-fin-green/20 text-fin-green',
        'inactive': 'bg-red-500/20 text-red-500',
      };
      
      const statusLabels: {[key: string]: string} = {
        'completed': 'Concluído',
        'pending': 'Pendente',
        'canceled': 'Cancelado',
        'active': 'Ativo',
        'inactive': 'Inativo',
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[value] || ''}`}>
          {statusLabels[value] || value}
        </span>
      );
    }
    
    return value || '-';
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    generateCustomReport(data);
  };

  // Toggle column selection
  const toggleColumn = (columnId: string) => {
    setCustomColumns(prev => 
      prev.map(col => 
        col.id === columnId 
          ? { ...col, selected: !col.selected } 
          : col
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <Button
          className="bg-fin-green hover:bg-fin-green/90 text-black"
          onClick={exportToCSV}
          disabled={!activeReportId || loading || !reportData.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="reports">Relatórios Prontos</TabsTrigger>
            <TabsTrigger value="custom">Relatório Personalizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer ${activeReportId === 'monthly' ? 'border-fin-green' : ''}`} onClick={generateMonthlyReport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileBarChart className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório Mensal
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Resumo das atividades financeiras do mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Visualize um resumo completo das suas transações, receitas e despesas do mês atual.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer ${activeReportId === 'quarterly' ? 'border-fin-green' : ''}`} onClick={generateQuarterlyReport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório Trimestral
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Análise dos últimos 3 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Compare suas finanças nos últimos três meses e identifique tendências importantes.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer ${activeReportId === 'annual' ? 'border-fin-green' : ''}`} onClick={generateAnnualReport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileBarChart className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório Anual
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Visão geral do ano financeiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Acompanhe seu progresso financeiro ao longo do ano e planeje o próximo.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
              
              <Card className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer ${activeReportId === 'clients' ? 'border-fin-green' : ''}`} onClick={generateClientReport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório de Clientes
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Lista completa de clientes e status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Visualize todos os seus clientes, informações de contato e status de pagamento.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
              
              <Card className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer ${activeReportId === 'categories' ? 'border-fin-green' : ''}`} onClick={generateCategoryReport}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Table className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório por Categoria
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Análise de gastos por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Entenda como seus recursos estão sendo distribuídos entre diferentes categorias.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow hover:border-fin-green/50 transition-colors cursor-pointer" onClick={() => setCustomReportOpen(true)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="mr-2 h-6 w-6 text-fin-green" />
                    Relatório Personalizado
                  </CardTitle>
                  <CardDescription className="text-[#94949F]">
                    Crie um relatório com filtros específicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#94949F] mb-4">
                    Defina filtros, períodos e campos para criar um relatório sob medida para suas necessidades.
                  </p>
                  <Button variant="outline" className="w-full border-fin-green text-fin-green hover:bg-fin-green/10">
                    Configurar Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-fin-green" />
                  Configurar Relatório Personalizado
                </CardTitle>
                <CardDescription>
                  Selecione filtros e opções para gerar um relatório personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="reportType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Relatório</FormLabel>
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1F1F23] border-[#2A2A2E]">
                                <SelectItem value="transactions">Transações</SelectItem>
                                <SelectItem value="clients">Clientes</SelectItem>
                                <SelectItem value="payments">Pagamentos</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período</FormLabel>
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                                <SelectValue placeholder="Selecione o período" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1F1F23] border-[#2A2A2E]">
                                <SelectItem value="month">Mês Atual</SelectItem>
                                <SelectItem value="quarter">Último Trimestre</SelectItem>
                                <SelectItem value="year">Último Ano</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch('dateRange') === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Inicial</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-[#1F1F23] border-[#2A2A2E]"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Final</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-[#1F1F23] border-[#2A2A2E]"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {form.watch('reportType') === 'transactions' && (
                      <div className="flex flex-col space-y-4">
                        <h4 className="text-sm font-medium">Filtrar por Tipo</h4>
                        <div className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="filterIncomes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <Label htmlFor="filterIncomes">Receitas</Label>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="filterExpenses"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <Label htmlFor="filterExpenses">Despesas</Label>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {form.watch('reportType') === 'transactions' && (
                      <div className="flex flex-col space-y-4">
                        <h4 className="text-sm font-medium">Colunas a Exibir</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {customColumns.map(column => (
                            <div key={column.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`column-${column.id}`}
                                checked={column.selected}
                                onCheckedChange={() => toggleColumn(column.id)}
                              />
                              <Label htmlFor={`column-${column.id}`}>{column.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="bg-fin-green text-black hover:bg-fin-green/90"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {activeReportId && (
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileSpreadsheet className="mr-2 h-6 w-6 text-fin-green" />
              {activeReportId === 'monthly' && 'Relatório Mensal'}
              {activeReportId === 'quarterly' && 'Relatório Trimestral'}
              {activeReportId === 'annual' && 'Relatório Anual'}
              {activeReportId === 'clients' && 'Relatório de Clientes'}
              {activeReportId === 'categories' && 'Relatório por Categoria'}
              {activeReportId === 'custom' && 'Relatório Personalizado'}
            </CardTitle>
            <CardDescription className="text-[#94949F]">
              {activeReportId === 'monthly' && `Dados de ${format(new Date(), 'MMMM yyyy')}`}
              {activeReportId === 'quarterly' && 'Dados dos últimos 3 meses'}
              {activeReportId === 'annual' && 'Dados dos últimos 12 meses'}
              {activeReportId === 'clients' && 'Lista completa de clientes'}
              {activeReportId === 'categories' && 'Análise por categoria (últimos 3 meses)'}
              {activeReportId === 'custom' && 'Dados filtrados de acordo com a seleção'}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {renderReportContent()}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#2A2A2E] p-4">
            <div className="text-sm text-[#94949F]">
              Total de registros: {reportData.length}
            </div>
            {reportData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-fin-green text-fin-green hover:bg-fin-green/10"
                onClick={exportToCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
      
      <Dialog open={customReportOpen} onOpenChange={setCustomReportOpen}>
        <DialogContent className="bg-[#1F1F23] border-[#2A2A2E] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configurar Relatório Personalizado</DialogTitle>
            <DialogDescription>
              Selecione filtros e opções para gerar um relatório personalizado
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Relatório</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectItem value="transactions">Transações</SelectItem>
                          <SelectItem value="clients">Clientes</SelectItem>
                          <SelectItem value="payments">Pagamentos</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1F1F23] border-[#2A2A2E]">
                          <SelectItem value="month">Mês Atual</SelectItem>
                          <SelectItem value="quarter">Último Trimestre</SelectItem>
                          <SelectItem value="year">Último Ano</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch('dateRange') === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Inicial</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-[#1F1F23] border-[#2A2A2E]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Final</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-[#1F1F23] border-[#2A2A2E]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {form.watch('reportType') === 'transactions' && (
                <div className="flex flex-col space-y-4">
                  <h4 className="text-sm font-medium">Filtrar por Tipo</h4>
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="filterIncomes"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label htmlFor="filterIncomes">Receitas</Label>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="filterExpenses"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <Label htmlFor="filterExpenses">Despesas</Label>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {form.watch('reportType') === 'transactions' && (
                <div className="flex flex-col space-y-4">
                  <h4 className="text-sm font-medium">Colunas a Exibir</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {customColumns.map(column => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`column-${column.id}`}
                          checked={column.selected}
                          onCheckedChange={() => toggleColumn(column.id)}
                        />
                        <Label htmlFor={`column-${column.id}`}>{column.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="bg-[#1F1F23] border-[#2A2A2E]">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  className="bg-fin-green text-black hover:bg-fin-green/90"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
