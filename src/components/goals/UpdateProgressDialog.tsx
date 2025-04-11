
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Progress } from '@/components/ui/progress';

const updateProgressSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'O valor deve ser um número positivo ou zero',
  }),
});

type UpdateProgressFormValues = z.infer<typeof updateProgressSchema>;

interface UpdateProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => Promise<void>;
  goalTitle: string;
  currentAmount: number;
  targetAmount: number;
}

export const UpdateProgressDialog: React.FC<UpdateProgressDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  goalTitle,
  currentAmount,
  targetAmount,
}) => {
  const form = useForm<UpdateProgressFormValues>({
    resolver: zodResolver(updateProgressSchema),
    defaultValues: {
      amount: currentAmount.toString(),
    },
  });

  const handleFormSubmit = async (values: UpdateProgressFormValues) => {
    await onSubmit(Number(values.amount));
    onOpenChange(false);
  };

  const progress = Math.min(100, Math.round((currentAmount / targetAmount) * 100)) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F1F23] border-[#2A2A2E] text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Atualizar Progresso</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{goalTitle}</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>R$ {currentAmount.toLocaleString('pt-BR')}</span>
            <span>R$ {targetAmount.toLocaleString('pt-BR')}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-[#2A2A2E]" 
          />
          <div className="text-right text-sm mt-1 text-fin-green">
            {progress}%
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Novo valor acumulado</FormLabel>
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
                Atualizar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
