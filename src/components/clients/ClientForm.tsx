
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingClient?: any;
}

export const ClientForm = ({ onSuccess, onCancel, editingClient }: ClientFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    status: "active",
    recurring_payment: false,
    monthly_value: 0,
    payment_due_day: 1,
    contract_start: undefined as Date | undefined,
    contract_end: undefined as Date | undefined,
    product_id: ""
  });

  useEffect(() => {
    fetchProducts();
    
    if (editingClient) {
      setFormData({
        name: editingClient.name || "",
        email: editingClient.email || "",
        phone: editingClient.phone || "",
        description: editingClient.description || "",
        status: editingClient.status || "active",
        recurring_payment: editingClient.recurring_payment || false,
        monthly_value: editingClient.monthly_value || 0,
        payment_due_day: editingClient.payment_due_day || 1,
        contract_start: editingClient.contract_start ? new Date(editingClient.contract_start) : undefined,
        contract_end: editingClient.contract_end ? new Date(editingClient.contract_end) : undefined,
        product_id: editingClient.product_id || ""
      });
    }
  }, [editingClient]);

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

  const handleProductChange = (productId: string) => {
    setFormData(prev => ({ ...prev, product_id: productId }));
    
    // Auto-preencher valor mensal baseado no produto selecionado
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct && formData.recurring_payment) {
      setFormData(prev => ({ ...prev, monthly_value: selectedProduct.price }));
    }
  };

  const handleRecurringPaymentChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, recurring_payment: checked }));
    
    // Auto-preencher valor mensal baseado no produto selecionado
    if (checked && formData.product_id) {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      if (selectedProduct) {
        setFormData(prev => ({ ...prev, monthly_value: selectedProduct.price }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      const clientData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        description: formData.description || null,
        status: formData.status,
        recurring_payment: formData.recurring_payment,
        monthly_value: formData.recurring_payment ? formData.monthly_value : null,
        payment_due_day: formData.recurring_payment ? formData.payment_due_day : null,
        contract_start: formData.contract_start ? formData.contract_start.toISOString() : null,
        contract_end: formData.contract_end ? formData.contract_end.toISOString() : null,
        product_id: formData.product_id || null,
        user_id: user.id
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id);
        
        if (error) throw error;
        
        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientData);
        
        if (error) throw error;
        
        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso"
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
        <Label htmlFor="product">Produto</Label>
        <Select value={formData.product_id} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum produto</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring_payment"
          checked={formData.recurring_payment}
          onCheckedChange={handleRecurringPaymentChange}
        />
        <Label htmlFor="recurring_payment">Pagamento recorrente</Label>
      </div>

      {formData.recurring_payment && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly_value">Valor Mensal</Label>
            <Input
              id="monthly_value"
              type="number"
              step="0.01"
              value={formData.monthly_value}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_value: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_due_day">Dia de Vencimento</Label>
            <Input
              id="payment_due_day"
              type="number"
              min="1"
              max="31"
              value={formData.payment_due_day}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_due_day: parseInt(e.target.value) || 1 }))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início do Contrato</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.contract_start ? format(formData.contract_start, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.contract_start}
                onSelect={(date) => setFormData(prev => ({ ...prev, contract_start: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Data de Fim do Contrato</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.contract_end ? format(formData.contract_end, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.contract_end}
                onSelect={(date) => setFormData(prev => ({ ...prev, contract_end: date }))}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-fin-green text-black hover:bg-fin-green/90">
          {editingClient ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
