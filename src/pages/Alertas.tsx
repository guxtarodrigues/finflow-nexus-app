
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus, Settings, Info, AlertTriangle, Trash2, Edit, Check, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAlertService, Alert } from '@/services/alertService';
import { AlertForm } from '@/components/alerts/AlertForm';
import { format } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Alertas = () => {
  const { 
    useAlerts, 
    useDeleteAlert, 
    useToggleAlertActive, 
    useMarkAlertAsRead,
    setupDefaultAlerts
  } = useAlertService();
  
  const { data: alerts = [], isLoading, isError, refetch } = useAlerts();
  const deleteAlert = useDeleteAlert();
  const toggleActive = useToggleAlertActive();
  const markAsRead = useMarkAlertAsRead();
  const { toast } = useToast();

  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false);
  const [isEditAlertOpen, setIsEditAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Ensure default alerts are set up when the page loads
    setupDefaultAlerts();
  }, []);

  const defaultAlerts = alerts.filter(alert => alert.is_default);
  const customAlerts = alerts.filter(alert => !alert.is_default);
  
  const displayedAlerts = activeTab === "all" 
    ? alerts 
    : activeTab === "default" 
      ? defaultAlerts 
      : customAlerts;

  const openEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsEditAlertOpen(true);
  };

  const openDeleteAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteAlert = async () => {
    if (!selectedAlert) return;
    
    try {
      await deleteAlert.mutateAsync(selectedAlert.id);
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    try {
      await toggleActive.mutateAsync({ 
        id: alert.id, 
        active: !alert.active 
      });
    } catch (error) {
      console.error('Error toggling alert active state:', error);
    }
  };

  const handleMarkAsRead = async (alert: Alert) => {
    if (alert.read) return;
    
    try {
      await markAsRead.mutateAsync(alert.id);
      toast({
        title: "Alerta marcado como lido",
        description: "O alerta foi marcado como lido com sucesso",
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const renderAlertCard = (alert: Alert) => (
    <Card 
      key={alert.id} 
      className={`bg-[#1F1F23] border-[#2A2A2E] text-white shadow ${!alert.read ? 'border-l-4 border-l-fin-green' : ''}`}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            {alert.type === "reminder" && <Bell className="mr-2 h-5 w-5 text-fin-green" />}
            {alert.type === "warning" && <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />}
            {alert.type === "info" && <Info className="mr-2 h-5 w-5 text-blue-500" />}
            {alert.type === "danger" && <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />}
            {alert.title}
          </CardTitle>
          <CardDescription className="text-[#94949F]">
            {alert.description}
          </CardDescription>
        </div>
        <Switch 
          checked={alert.active} 
          onCheckedChange={() => handleToggleActive(alert)}
        />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {alert.type === "reminder" && (
              <Badge variant="outline" className="bg-fin-green/10 text-fin-green border-fin-green">Lembrete</Badge>
            )}
            {alert.type === "warning" && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Atenção</Badge>
            )}
            {alert.type === "info" && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">Informativo</Badge>
            )}
            {alert.type === "danger" && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">Crítico</Badge>
            )}
            {alert.due_date && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
                {format(new Date(alert.due_date), 'dd/MM/yyyy')}
              </Badge>
            )}
            {!alert.read && (
              <Badge variant="outline" className="bg-white/10 text-white border-white">Não lido</Badge>
            )}
            {alert.is_default && (
              <Badge variant="outline" className="bg-blue-700/10 text-blue-400 border-blue-700">Padrão</Badge>
            )}
          </div>
          <div className="flex space-x-1">
            {!alert.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleMarkAsRead(alert)}
                className="text-[#94949F] hover:text-white hover:bg-[#2A2A2E]"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openEditAlert(alert)}
              className="text-[#94949F] hover:text-white hover:bg-[#2A2A2E]"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!alert.is_default && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openDeleteAlert(alert)}
                className="text-[#94949F] hover:text-red-500 hover:bg-[#2A2A2E]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Alertas Financeiros</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#2A2A2E] text-white hover:bg-[#2A2A2E]">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button 
            className="bg-fin-green hover:bg-fin-green/90 text-black"
            onClick={() => setIsAddAlertOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Alerta
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-[#1F1F23] border border-[#2A2A2E]">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="default">Padrão</TabsTrigger>
          <TabsTrigger value="custom">Personalizados</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 w-3/4 bg-[#2A2A2E] rounded"></div>
                <div className="h-4 w-1/2 bg-[#2A2A2E] rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <div className="h-6 w-24 bg-[#2A2A2E] rounded"></div>
                  <div className="h-6 w-16 bg-[#2A2A2E] rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-400" />
            <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
            <p className="text-center text-[#94949F]">
              Não foi possível carregar os alertas. Tente novamente mais tarde.
            </p>
            <Button 
              onClick={handleRetry}
              className="mt-4 flex items-center gap-2 border-fin-green text-fin-green hover:bg-fin-green/10"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedAlerts.length > 0 ? (
            displayedAlerts.map((alert) => renderAlertCard(alert))
          ) : (
            <Card className="bg-[#1F1F23] border-[#2A2A2E] text-white shadow col-span-2">
              <CardContent className="p-6 flex flex-col items-center space-y-4">
                <Bell className="h-12 w-12 text-[#2A2A2E] mb-2" />
                <h2 className="text-xl font-semibold">
                  {activeTab === "all" 
                    ? "Nenhum alerta cadastrado" 
                    : activeTab === "default" 
                      ? "Nenhum alerta padrão disponível" 
                      : "Nenhum alerta personalizado cadastrado"}
                </h2>
                <p className="text-center text-[#94949F]">
                  {activeTab === "custom" && "Você ainda não possui alertas financeiros personalizados cadastrados. Clique em \"Novo Alerta\" para começar!"}
                </p>
                {activeTab === "custom" && (
                  <Button 
                    variant="outline" 
                    className="border-fin-green text-fin-green hover:bg-fin-green/10 mt-2"
                    onClick={() => setIsAddAlertOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Alerta
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {displayedAlerts.length > 0 && activeTab === "custom" && (
            <Card className="bg-[#1F1F23] border-[#2A2A2E] border-dashed text-white shadow flex flex-col items-center justify-center p-6 h-[170px]">
              <Plus className="h-12 w-12 text-[#2A2A2E] mb-2" />
              <p className="text-[#94949F] mb-4 text-center">Adicione um novo alerta financeiro</p>
              <Button 
                variant="outline" 
                className="border-fin-green text-fin-green hover:bg-fin-green/10"
                onClick={() => setIsAddAlertOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Alerta
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Create Alert Dialog */}
      <AlertForm
        open={isAddAlertOpen}
        onOpenChange={setIsAddAlertOpen}
        mode="create"
      />

      {/* Edit Alert Dialog */}
      {selectedAlert && (
        <AlertForm
          open={isEditAlertOpen}
          onOpenChange={setIsEditAlertOpen}
          mode="edit"
          alertId={selectedAlert.id}
          defaultValues={{
            title: selectedAlert.title,
            description: selectedAlert.description,
            type: selectedAlert.type as any,
            active: selectedAlert.active,
            due_date: selectedAlert.due_date ? new Date(selectedAlert.due_date) : undefined,
          }}
        />
      )}

      {/* Delete Alert Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-[#1F1F23] border-[#2A2A2E] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Alerta</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94949F]">
              Tem certeza que deseja excluir o alerta "{selectedAlert?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#2A2A2E] text-white border-[#3A3A3E] hover:bg-[#3A3A3E]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAlert}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Alertas;
