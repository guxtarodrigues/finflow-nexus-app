import { useState } from "react";
import { CreateAlertInput, useAlertService } from "@/services/alertService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres",
  }),
  description: z.string().min(2, {
    message: "A descrição deve ter pelo menos 2 caracteres",
  }),
  type: z.enum(["reminder", "warning", "info", "danger"], {
    required_error: "Por favor selecione um tipo de alerta",
  }),
  active: z.boolean().default(true),
  due_date: z.date().optional(),
});

type AlertFormValues = z.infer<typeof formSchema>;

interface AlertFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<AlertFormValues>;
  mode: "create" | "edit";
  alertId?: string;
}

export const AlertForm = ({ 
  open, 
  onOpenChange, 
  defaultValues = {
    title: "",
    description: "",
    type: "info",
    active: true,
    due_date: undefined,
  },
  mode,
  alertId,
}: AlertFormProps) => {
  const { useCreateAlert, useUpdateAlert } = useAlertService();
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (values: AlertFormValues) => {
    try {
      const alertData = {
        title: values.title,
        description: values.description,
        type: values.type,
        active: values.active,
        due_date: values.due_date ? values.due_date.toISOString() : null,
      };

      if (mode === "create") {
        await createAlert.mutateAsync(alertData);
      } else if (mode === "edit" && alertId) {
        await updateAlert.mutateAsync({ id: alertId, updates: alertData });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1F1F23] border-[#2A2A2E] text-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Novo Alerta" : "Editar Alerta"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Título do alerta"
                      {...field}
                      className="bg-[#101014] border-[#2A2A2E]"
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do alerta"
                      {...field}
                      className="bg-[#101014] border-[#2A2A2E] min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#101014] border-[#2A2A2E]">
                        <SelectValue placeholder="Selecione o tipo de alerta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1F1F23] border-[#2A2A2E] text-white">
                      <SelectItem value="reminder">Lembrete</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="info">Informativo</SelectItem>
                      <SelectItem value="danger">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal bg-[#101014] border-[#2A2A2E] ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1F1F23] border-[#2A2A2E] text-white">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-[#1F1F23]"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2A2A2E] p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-[#2A2A2E] text-white hover:bg-[#2A2A2E]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-fin-green hover:bg-fin-green/90 text-black"
                disabled={createAlert.isPending || updateAlert.isPending}
              >
                {createAlert.isPending || updateAlert.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
