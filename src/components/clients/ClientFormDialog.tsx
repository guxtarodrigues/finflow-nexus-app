
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Client } from "@/types/clients";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ClientFormDialogProps {
  client?: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClientFormDialog = ({ client, isOpen, onClose, onSuccess }: ClientFormDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    status: "active",
    product_id: "",
    recurring_payment: false,
    monthly_value: 0,
    payment_due_day: 1,
    contract_start: "",
    contract_end: ""
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        description: client.description || "",
        status: client.status || "active",
        product_id: client.product_id || "",
        recurring_payment: client.recurring_payment || false,
        monthly_value: client.monthly_value || 0,
        payment_due_day: client.payment_due_day || 1,
        contract_start: client.contract_start ? new Date(client.contract_start).toISOString().split('T')[0] : "",
        contract_end: client.contract_end ? new Date(client.contract_end).toISOString().split('T')[0] : ""
      });
    } else {
      resetForm();
    }
  }, [client]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      description: "",
      status: "active",
      product_id: "",
      recurring_payment: false,
      monthly_value: 0,
      payment_due_day: 1,
      contract_start: "",
      contract_end: ""
    });
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      monthly_value: selectedProduct ? selectedProduct.price : formData.monthly_value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        description: formData.description || null,
        status: formData.status,
        product_id: formData.product_id || null,
        recurring_payment: formData.recurring_payment,
        monthly_value: formData.recurring_payment ? formData.monthly_value : null,
        payment_due_day: formData.recurring_payment ? formData.payment_due_day : null,
        contract_start: formData.contract_start || null,
        contract_end: formData.contract_end || null,
        updated_at: new Date().toISOString()
      };

      if (client) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;

        toast({
          title: "Cliente atualizado com sucesso!",
          description: "As alterações foram salvas."
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({
            ...clientData,
            user_id: user?.id
          });

        if (error) throw error;

        toast({
          title: "Cliente criado com sucesso!",
          description: "O cliente foi adicionado à sua lista."
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_id">Produto Vinculado</Label>
            <Select value={formData.product_id} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum produto</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informações adicionais sobre o cliente"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring_payment"
                checked={formData.recurring_payment}
                onCheckedChange={(checked) => setFormData({ ...formData, recurring_payment: checked })}
              />
              <Label htmlFor="recurring_payment">Pagamento Recorrente</Label>
            </div>

            {formData.recurring_payment && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_value">Valor Mensal (R$)</Label>
                  <Input
                    id="monthly_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthly_value}
                    onChange={(e) => setFormData({ ...formData, monthly_value: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_due_day">Dia do Vencimento</Label>
                  <Input
                    id="payment_due_day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.payment_due_day}
                    onChange={(e) => setFormData({ ...formData, payment_due_day: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            {formData.recurring_payment && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_start">Início do Contrato</Label>
                  <Input
                    id="contract_start"
                    type="date"
                    value={formData.contract_start}
                    onChange={(e) => setFormData({ ...formData, contract_start: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_end">Fim do Contrato</Label>
                  <Input
                    id="contract_end"
                    type="date"
                    value={formData.contract_end}
                    onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (client ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
