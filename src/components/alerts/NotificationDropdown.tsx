
import { useState, useEffect } from "react";
import { Alert, useAlertService } from "@/services/alertService";
import { Bell, Check, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NotificationDropdown = () => {
  const { useUnreadAlerts, useMarkAlertAsRead, setupDefaultAlerts } = useAlertService();
  const { data: unreadAlerts = [], isLoading } = useUnreadAlerts();
  const markAsRead = useMarkAlertAsRead();
  const navigate = useNavigate();

  // Ensure default alerts are available
  useEffect(() => {
    setupDefaultAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead.mutateAsync(alertId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Hoje, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Ontem, ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const getIconForAlertType = (type: string) => {
    switch (type) {
      case "reminder":
        return <Bell className="h-4 w-4 text-fin-green" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const viewAllNotifications = () => {
    navigate("/alertas");
  };

  // Filter to show only active alerts in the dropdown
  const activeUnreadAlerts = unreadAlerts.filter(alert => alert.active);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {activeUnreadAlerts.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-fin-green text-black text-xs"
              variant="outline"
            >
              {activeUnreadAlerts.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-[#94949F]">Carregando...</div>
        ) : activeUnreadAlerts.length === 0 ? (
          <div className="p-4 text-center text-[#94949F]">Não há notificações não lidas</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {activeUnreadAlerts.map((alert) => (
              <DropdownMenuItem 
                key={alert.id} 
                className="p-2 cursor-pointer flex justify-between group"
                onClick={() => navigate("/alertas")}
              >
                <div className="flex gap-2 flex-grow">
                  <div className="mt-0.5">
                    {getIconForAlertType(alert.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-[#94949F] line-clamp-2">{alert.description}</p>
                    <p className="text-xs text-[#94949F] mt-1">{formatDate(alert.created_at)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleMarkAsRead(alert.id, e)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center text-fin-green hover:text-fin-green hover:bg-fin-green/10"
          onClick={viewAllNotifications}
        >
          Ver todos os alertas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
