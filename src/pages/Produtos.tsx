
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_percentage: number;
  operational_expense_percentage: number;
  tax_percentage: number;
  financial_cost_percentage: number;
  created_at: string;
}

const Produtos = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost_percentage: 0,
    operational_expense_percentage: 0,
    tax_percentage: 6, // Default 6% for taxes
    financial_cost_percentage: 0
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            cost_percentage: formData.cost_percentage,
            operational_expense_percentage: formData.operational_expense_percentage,
            tax_percentage: formData.tax_percentage,
            financial_cost_percentage: formData.financial_cost_percentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado com sucesso!",
          description: "As alterações foram salvas."
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            user_id: user?.id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            cost_percentage: formData.cost_percentage,
            operational_expense_percentage: formData.operational_expense_percentage,
            tax_percentage: formData.tax_percentage,
            financial_cost_percentage: formData.financial_cost_percentage
          });

        if (error) throw error;

        toast({
          title: "Produto criado com sucesso!",
          description: "O produto foi adicionado à sua lista."
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      cost_percentage: product.cost_percentage,
      operational_expense_percentage: product.operational_expense_percentage,
      tax_percentage: product.tax_percentage,
      financial_cost_percentage: product.financial_cost_percentage
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto excluído com sucesso!",
        description: "O produto foi removido da sua lista."
      });

      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      cost_percentage: 0,
      operational_expense_percentage: 0,
      tax_percentage: 6,
      financial_cost_percentage: 0
    });
    setEditingProduct(null);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const calculateMargins = (product: Product) => {
    const totalCosts = product.cost_percentage + product.operational_expense_percentage + 
                     product.tax_percentage + product.financial_cost_percentage;
    const netMargin = 100 - totalCosts;
    const netValue = (product.price * netMargin) / 100;
    
    return {
      totalCosts,
      netMargin,
      netValue
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e configure custos para cálculo automático do DRE
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: Consultoria Empresarial"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do produto ou serviço"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Custos e Taxas (%)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_percentage">Custo do Produto/Serviço (%)</Label>
                    <Input
                      id="cost_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.cost_percentage}
                      onChange={(e) => setFormData({ ...formData, cost_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="operational_expense_percentage">Despesas Operacionais (%)</Label>
                    <Input
                      id="operational_expense_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.operational_expense_percentage}
                      onChange={(e) => setFormData({ ...formData, operational_expense_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_percentage">Impostos (%)</Label>
                    <Input
                      id="tax_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tax_percentage}
                      onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="6,00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="financial_cost_percentage">Custos Financeiros (%)</Label>
                    <Input
                      id="financial_cost_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.financial_cost_percentage}
                      onChange={(e) => setFormData({ ...formData, financial_cost_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Resumo dos Custos</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Total de Custos:</span>
                      <span>{(formData.cost_percentage + formData.operational_expense_percentage + formData.tax_percentage + formData.financial_cost_percentage).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem Líquida:</span>
                      <span>{(100 - (formData.cost_percentage + formData.operational_expense_percentage + formData.tax_percentage + formData.financial_cost_percentage)).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Valor Líquido:</span>
                      <span>{formatCurrency((formData.price * (100 - (formData.cost_percentage + formData.operational_expense_percentage + formData.tax_percentage + formData.financial_cost_percentage))) / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Atualizar' : 'Criar'} Produto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-muted-foreground">Carregando produtos...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece criando seu primeiro produto para configurar os custos e taxas.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => {
              const margins = calculateMargins(product);
              return (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{product.name}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.description && (
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Preço:</span>
                        <span className="font-medium">{formatCurrency(product.price)}</span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Custo Produto:</span>
                          <span>{product.cost_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Desp. Operacionais:</span>
                          <span>{product.operational_expense_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impostos:</span>
                          <span>{product.tax_percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custos Financeiros:</span>
                          <span>{product.financial_cost_percentage}%</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Custos:</span>
                          <span className="text-red-600">{margins.totalCosts.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Margem Líquida:</span>
                          <span className="text-green-600">{margins.netMargin.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Valor Líquido:</span>
                          <span className="text-green-600">{formatCurrency(margins.netValue)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Produtos;
