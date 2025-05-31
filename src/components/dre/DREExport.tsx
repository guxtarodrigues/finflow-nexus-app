
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Mail, Save } from 'lucide-react';
import { DREData, useSaveDRESnapshot } from '@/hooks/useDREData';
import { useToast } from '@/hooks/use-toast';

interface DREExportProps {
  dreData?: DREData;
  filters: {
    period_start: string;
    period_end: string;
    client_id?: string;
  };
  comparisonData?: DREData;
  comparisonFilters?: {
    period_start: string;
    period_end: string;
    client_id?: string;
  } | null;
}

export const DREExport: React.FC<DREExportProps> = ({
  dreData,
  filters,
  comparisonData,
  comparisonFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveDRESnapshot } = useSaveDRESnapshot();
  const { toast } = useToast();

  const handleSaveSnapshot = async () => {
    if (!dreData) return;

    setIsSaving(true);
    try {
      await saveDRESnapshot(dreData, filters);
      toast({
        title: "Snapshot salvo",
        description: "DRE foi salvo com sucesso no histórico",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o snapshot do DRE",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dreData) return;

    setIsExporting(true);
    try {
      // Implementação básica de exportação
      // Em uma implementação real, usaria uma biblioteca como jsPDF ou chamaria uma edge function
      const printContent = generatePrintableHTML();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: "PDF gerado",
        description: "DRE exportado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o DRE",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const generatePrintableHTML = () => {
    if (!dreData) return '';

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DRE - ${dreData.periodo.inicio} a ${dreData.periodo.fim}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .value { text-align: right; }
            .total { font-weight: bold; background-color: #f0f0f0; }
            .negative { color: #d32f2f; }
            .positive { color: #2e7d32; }
          </style>
        </head>
        <body>
          <h1>Demonstração do Resultado do Exercício</h1>
          <p><strong>Período:</strong> ${new Date(dreData.periodo.inicio).toLocaleDateString('pt-BR')} a ${new Date(dreData.periodo.fim).toLocaleDateString('pt-BR')}</p>
          
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Receita Bruta</td>
                <td class="value positive">${formatCurrency(dreData.receita_bruta)}</td>
              </tr>
              <tr>
                <td>(-) Deduções</td>
                <td class="value negative">${formatCurrency(dreData.deducoes)}</td>
              </tr>
              <tr class="total">
                <td>Receita Líquida</td>
                <td class="value">${formatCurrency(dreData.receita_liquida)}</td>
              </tr>
              <tr>
                <td>(-) Custo dos Produtos/Serviços</td>
                <td class="value negative">${formatCurrency(dreData.custo_produtos_servicos)}</td>
              </tr>
              <tr class="total">
                <td>Lucro Bruto</td>
                <td class="value">${formatCurrency(dreData.lucro_bruto)}</td>
              </tr>
              <tr>
                <td>(-) Despesas Operacionais</td>
                <td class="value negative">${formatCurrency(dreData.despesas_operacionais)}</td>
              </tr>
              <tr class="total">
                <td>Resultado Operacional</td>
                <td class="value">${formatCurrency(dreData.resultado_operacional)}</td>
              </tr>
              <tr>
                <td>(+/-) Resultado Financeiro</td>
                <td class="value ${dreData.resultado_financeiro >= 0 ? 'positive' : 'negative'}">${formatCurrency(dreData.resultado_financeiro)}</td>
              </tr>
              <tr class="total">
                <td>Lucro Antes dos Impostos</td>
                <td class="value">${formatCurrency(dreData.lucro_antes_impostos)}</td>
              </tr>
              <tr>
                <td>(-) Impostos</td>
                <td class="value negative">${formatCurrency(dreData.impostos)}</td>
              </tr>
              <tr class="total">
                <td><strong>Lucro Líquido</strong></td>
                <td class="value ${dreData.lucro_liquido >= 0 ? 'positive' : 'negative'}"><strong>${formatCurrency(dreData.lucro_liquido)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p><small>DRE gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</small></p>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar DRE</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button
                  onClick={handleSaveSnapshot}
                  disabled={isSaving || !dreData}
                  className="w-full flex items-center space-x-2"
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Snapshot'}</span>
                </Button>

                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting || !dreData}
                  className="w-full flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
                </Button>

                <Button
                  disabled={!dreData}
                  className="w-full flex items-center space-x-2"
                  variant="outline"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar por Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p><strong>Período:</strong> {dreData ? `${new Date(dreData.periodo.inicio).toLocaleDateString('pt-BR')} - ${new Date(dreData.periodo.fim).toLocaleDateString('pt-BR')}` : 'N/A'}</p>
            {comparisonData && comparisonFilters && (
              <p><strong>Comparação:</strong> {`${new Date(comparisonFilters.period_start).toLocaleDateString('pt-BR')} - ${new Date(comparisonFilters.period_end).toLocaleDateString('pt-BR')}`}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
