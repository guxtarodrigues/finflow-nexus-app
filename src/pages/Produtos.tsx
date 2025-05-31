
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_percentage: number;
  operational_expense_percentage: number;
  tax_percentage: number;
  financial_cost_percentage: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost_percentage: 0,
    operational_expense_percentage: 0,
    tax_percentage: 0,
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
        .order('name');
      
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
      if (!user) return;
      
      if (!formData.name || formData.price <= 0) {
        toast({
          title: "Dados incompletos",
          description: "Preencha nome e preço válidos",
          variant: "destructive"
        });
        return;
      }
      
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
            financial_cost_percentage: formData.financial_cost_percentage
          })
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            cost_percentage: formData.cost_percentage,
            operational_expense_percentage: formData.operational_expense_percentage,
            tax_percentage: formData.tax_percentage,
            financial_cost_percentage: formData.financial_cost_percentage,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso"
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
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      cost_percentage: 0,
      operational_expense_percentage: 0,
      tax_percentage: 0,
      financial_cost_percentage: 0
    });
    setEditingProduct(null);
  };
  
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      cost_percentage: product.cost_percentage,
      operational_expense_percentage: product.operational_expense_percentage,
      tax_percentage: product.tax_percentage,
      financial_cost_percentage: product.financial_cost_percentage
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso"
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
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };
  
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e configure custos para cálculo automático do DRE
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-fin-green" />
            Todos os Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Custo (%)</TableHead>
                  <TableHead>Desp. Op. (%)</TableHead>
                  <TableHead>Impostos (%)</TableHead>
                  <TableHead>Fin. (%)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground">{product.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{formatPercentage(product.cost_percentage)}</TableCell>
                    <TableCell>{formatPercentage(product.operational_expense_percentage)}</TableCell>
                    <TableCell>{formatPercentage(product.tax_percentage)}</TableCell>
                    <TableCell>{formatPercentage(product.financial_cost_percentage)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
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
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              Configure seu produto e os percentuais de custos para cálculo automático do DRE
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Percentuais de Custos e Taxas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_percentage">Custo do Produto (%)</Label>
                  <Input
                    id="cost_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.cost_percentage}
                    onChange={(e) => setFormData({...formData, cost_percentage: parseFloat(e.target.value) || 0})}
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
                    onChange={(e) => setFormData({...formData, operational_expense_percentage: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_percentage">Impostos (%)</Label>
                  <Input
                    id="tax_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({...formData, tax_percentage: parseFloat(e.target.value) || 0})}
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
                    onChange={(e) => setFormData({...formData, financial_cost_percentage: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-fin-green text-black hover:bg-fin-green/90">
                {editingProduct ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;
