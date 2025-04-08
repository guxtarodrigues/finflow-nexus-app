
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { BlurModal } from "@/components/ui/blur-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/types";

const Categorias = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense" | "investment",
    color: "#6E59A5"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  const colorOptions = [
    "#6E59A5", "#9E77ED", "#E879F9", "#EC4899", 
    "#EF4444", "#F97316", "#FACC15", "#84CC16", 
    "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6"
  ];
  
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);
  
  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name,
        type: category.type,
        color: category.color || "#6E59A5"
      });
    } else {
      setEditingCategory(null);
      setNewCategory({
        name: "",
        type: "expense",
        color: "#6E59A5"
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSaveCategory = async () => {
    try {
      if (!user) return;
      
      if (!newCategory.name) {
        toast({
          title: "Campo obrigatório",
          description: "O nome da categoria é obrigatório",
          variant: "destructive"
        });
        return;
      }
      
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso",
        });
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Erro ao salvar categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso",
      });
      
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Receita";
      case "expense":
        return "Despesa";
      case "investment":
        return "Investimento";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias para organizar suas finanças
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal">
            Todas as Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenModal()}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cor</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: category.color || "#6E59A5" }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{getCategoryTypeLabel(category.type)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
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
      
      <BlurModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingCategory ? "Edite os dados da categoria" : "Preencha os campos para criar uma nova categoria"}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: "income" | "expense" | "investment") => 
                  setNewCategory({...newCategory, type: value})
                }
              >
                <SelectTrigger id="type" className="bg-white/10 border-white/20">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label className="flex items-center">
                <Palette className="h-4 w-4 mr-2" /> Cor
              </Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${
                      newCategory.color === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({...newCategory, color})}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="border-white/20"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Salvar alterações" : "Criar categoria"}
            </Button>
          </div>
        </div>
      </BlurModal>
    </div>
  );
};

export default Categorias;
