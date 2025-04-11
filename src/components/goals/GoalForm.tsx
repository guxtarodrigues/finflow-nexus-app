
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Goal } from '@/services/goalService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const goalFormSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  target_amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O valor deve ser um número positivo',
  }),
  current_amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'O valor deve ser um número positivo ou zero',
  }),
  category: z.string().min(1, 'Categoria é obrigatória'),
  category_color: z.string().min(1, 'Cor da categoria é obrigatória'),
  deadline: z.date().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: Partial<Goal>;
  mode: 'create' | 'edit';
}

export const GoalForm: React.FC<GoalFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}) => {
  const title = mode === 'create' ? 'Criar Nova Meta' : 'Editar Meta';
  
  // Convert deadline string to Date if exists
  const formattedDefaultValues = {
    ...defaultValues,
    target_amount: defaultValues?.target_amount?.toString() || '',
    current_amount: defaultValues?.current_amount?.toString() || '',
    deadline: defaultValues?.deadline ? new Date(defaultValues.deadline) : undefined,
  };

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: formattedDefaultValues || {
      title: '',
      description: '',
      target_amount: '',
      current_amount: '0',
      category: 'Economia',
      category_color: '#10B981',
      deadline: undefined,
    },
  });

  const handleFormSubmit = async (values: GoalFormValues) => {
    const formattedData = {
      ...values,
      target_amount: Number(values.target_amount),
      current_amount: Number(values.current_amount),
      deadline: values.deadline ? values.deadline.toISOString() : null,
    };
    
    await onSubmit(formattedData);
    onOpenChange(false);
    form.reset();
  };

  // Predefined categories with colors
  const categories = [
    { name: 'Fundo de Emergência', color: '#10B981' },
    { name: 'Viagem', color: '#6366F1' },
    { name: 'Investimentos', color: '#F59E0B' },
    { name: 'Equipamentos', color: '#EC4899' },
    { name: 'Educação', color: '#8B5CF6' },
    { name: 'Aposentadoria', color: '#3B82F6' },
    { name: 'Automóvel', color: '#EF4444' },
    { name: 'Casa', color: '#06B6D4' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F1F23] border-[#2A2A2E] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome da meta" 
                      className="bg-[#2A2A2E] border-[#3A3A3E] text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva sua meta (opcional)" 
                      className="bg-[#2A2A2E] border-[#3A3A3E] text-white min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Valor Total</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="R$ 0,00" 
                        className="bg-[#2A2A2E] border-[#3A3A3E] text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="current_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Valor Atual</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="R$ 0,00" 
                        className="bg-[#2A2A2E] border-[#3A3A3E] text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Prazo (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full bg-[#2A2A2E] border-[#3A3A3E] text-white pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: pt })
                          ) : (
                            <span>Selecionar data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#2A2A2E] border-[#3A3A3E]">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-[#2A2A2E] text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Categoria</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full bg-[#2A2A2E] border border-[#3A3A3E] text-white rounded-md h-10 px-3"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-select the corresponding color
                          const category = categories.find(cat => cat.name === e.target.value);
                          if (category) {
                            form.setValue('category_color', category.color);
                          }
                        }}
                      >
                        {categories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Cor</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 h-10">
                        <input 
                          type="color" 
                          {...field} 
                          className="bg-[#2A2A2E] border-[#3A3A3E] w-10 h-10 rounded cursor-pointer"
                        />
                        <Input 
                          {...field} 
                          className="bg-[#2A2A2E] border-[#3A3A3E] text-white flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="border-fin-green text-fin-green hover:bg-fin-green/10"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-fin-green text-black hover:bg-fin-green/90"
              >
                {mode === 'create' ? 'Criar Meta' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
