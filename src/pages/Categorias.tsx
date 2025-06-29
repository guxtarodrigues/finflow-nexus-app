
import { useState, useEffect } from "react";
import { 
  Database, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Tag,
  ChevronDown,
  Filter
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "investment";
  color: string;
  user_id: string;
  dre_classification?: string;
  created_at: string;
  updated_at: string;
}

const CATEGORY_COLORS = [
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f97316" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#22c55e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
];

const DRE_CLASSIFICATIONS = [
  { value: "nao_classificado", label: "Não classificado" },
  { value: "receita_bruta", label: "Receita Bruta" },
  { value: "deducoes", label: "Deduções" },
  { value: "custo_produtos_servicos", label: "Custo de Produtos/Serviços" },
  { value: "despesas_operacionais", label: "Despesas Operacionais" },
  { value: "resultado_financeiro", label: "Resultado Financeiro" },
  { value: "impostos", label: "Impostos" },
];

const Categorias = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeCategories, setActiveCategories] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New category form state
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense" | "investment",
    color: CATEGORY_COLORS[0].value,
    dre_classification: "nao_classificado"
  });
  
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, filterType]);
  
  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (filterType) {
        query = query.eq('type', filterType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setCategories(data as Category[]);
        setActiveCategories(data.length);
      }
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
  
  const handleCreateCategory = async () => {
    try {
      if (!user) return;
      
      if (!newCategory.name || !newCategory.type || !newCategory.color) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      const dreClassification = newCategory.dre_classification === "nao_classificado" ? null : newCategory.dre_classification;
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          type: newCategory.type,
          color: newCategory.color,
          dre_classification: dreClassification,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setNewCategory({
        name: "",
        type: "expense",
        color: CATEGORY_COLORS[0].value,
        dre_classification: "nao_classificado"
      });
      
      setIsDialogOpen(false);
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso"
      });
      
      fetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro ao criar categoria",
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
        description: "A categoria foi excluída com sucesso"
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
  
  const handleUpdateCategory = async () => {
    try {
      if (!selectedCategory) return;
      
      const dreClassification = selectedCategory.dre_classification === "nao_classificado" ? null : selectedCategory.dre_classification;
      
      const { error } = await supabase
        .from('categories')
        .update({
          name: selectedCategory.name,
          type: selectedCategory.type,
          color: selectedCategory.color,
          dre_classification: dreClassification
        })
        .eq('id', selectedCategory.id);
      
      if (error) throw error;
      
      setIsEditSheetOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso"
      });
      
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">Receita</Badge>;
      case "expense":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Despesa</Badge>;
      case "investment":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-0">Investimento</Badge>;
      default:
        return null;
    }
  };

  const getDREClassificationLabel = (classification?: string) => {
    if (!classification || classification === "nao_classificado") {
      return <Badge variant="secondary">Não classificado</Badge>;
    }
    
    const dreClass = DRE_CLASSIFICATIONS.find(c => c.value === classification);
    return <Badge className="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 border-0">
      {dreClass?.label || classification}
    </Badge>;
  };

  const openEditSheet = (category: Category) => {
    setSelectedCategory(category);
    setIsEditSheetOpen(true);
  };

  const closeEditSheet = () => {
    setIsEditSheetOpen(false);
    setSelectedCategory(null);
  };
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerenciamento de categorias para transações e classificação DRE
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-fin-green text-black hover:bg-fin-green/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Total de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activeCategories}</div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Classificadas para DRE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {categories.filter(c => c.dre_classification).length}
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-normal">Não Classificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">
                {categories.filter(c => !c.dre_classification).length}
              </div>
              <Tag className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-normal flex items-center">
            <Tag className="mr-2 h-5 w-5 text-fin-green" />
            Todas as Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar categorias..."
                  className="pl-8 bg-[#1F1F23] border-[#2A2A2E]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#2A2A2E] bg-[#1F1F23]">
                    <Filter className="mr-2 h-4 w-4" /> Filtrar
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType(null)}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("income")}>
                    Receitas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("expense")}>
                    Despesas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("investment")}>
                    Investimentos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Cor</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Classificação DRE</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{getCategoryTypeLabel(category.type)}</TableCell>
                      <TableCell>{getDREClassificationLabel(category.dre_classification)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSheet(category)}
                          >
                            <Edit2 className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>
      
      {/* Create Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria e classifique-a para o DRE.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select 
                value={newCategory.type} 
                onValueChange={(value) => setNewCategory({...newCategory, type: value as "income" | "expense" | "investment"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dre_classification" className="text-right">
                DRE
              </Label>
              <Select 
                value={newCategory.dre_classification} 
                onValueChange={(value) => setNewCategory({...newCategory, dre_classification: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Classificação DRE" />
                </SelectTrigger>
                <SelectContent>
                  {DRE_CLASSIFICATIONS.map((classification) => (
                    <SelectItem key={classification.value} value={classification.value}>
                      {classification.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <div
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer ${
                      newCategory.color === color.value ? 'ring-2 ring-offset-2 ring-fin-green' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewCategory({...newCategory, color: color.value})}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleCreateCategory}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Categoria</SheetTitle>
            <SheetDescription>
              Atualize os dados da categoria e sua classificação DRE.
            </SheetDescription>
          </SheetHeader>
          {selectedCategory && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Select 
                  value={selectedCategory.type} 
                  onValueChange={(value) => setSelectedCategory({...selectedCategory, type: value as "income" | "expense" | "investment"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dre">Classificação DRE</Label>
                <Select 
                  value={selectedCategory.dre_classification || "nao_classificado"} 
                  onValueChange={(value) => setSelectedCategory({...selectedCategory, dre_classification: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Classificação DRE" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRE_CLASSIFICATIONS.map((classification) => (
                      <SelectItem key={classification.value} value={classification.value}>
                        {classification.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((color) => (
                    <div
                      key={color.value}
                      className={`w-8 h-8 rounded-full cursor-pointer ${
                        selectedCategory.color === color.value ? 'ring-2 ring-offset-2 ring-fin-green' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedCategory({...selectedCategory, color: color.value})}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeEditSheet}>
                  Cancelar
                </Button>
                <Button className="bg-fin-green text-black hover:bg-fin-green/90" onClick={handleUpdateCategory}>
                  Salvar alterações
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Categorias;
