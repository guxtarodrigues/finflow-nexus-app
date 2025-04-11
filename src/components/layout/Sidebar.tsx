import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  Users,
  TrendingUp,
  PieChart,
  FileText,
  Settings,
  CircleDollarSign,
  Clock,
  Database as CategoryIcon,
  BarChart,
  FileBarChart,
  Target,
  Bell,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
      expanded: false,
    },
    {
      name: "Movimentações",
      path: "#",
      icon: <ArrowLeftRight size={20} />,
      expanded: true,
      subItems: [
        {
          name: "Movimentações",
          path: "/movimentacoes",
          icon: <ArrowLeftRight size={18} />,
        },
        {
          name: "Pagamentos",
          path: "/pagamentos",
          icon: <CreditCard size={18} />,
        },
        {
          name: "Recebimentos",
          path: "/recebimentos",
          icon: <Inbox size={18} />,
        },
        {
          name: "Categorias",
          path: "/categorias",
          icon: <CategoryIcon size={18} />,
        },
        {
          name: "Clientes",
          path: "/clientes",
          icon: <Users size={18} />,
        },
        {
          name: "Investimentos",
          path: "/investimentos",
          icon: <CircleDollarSign size={18} />,
        },
      ],
    },
    {
      name: "Análises",
      path: "/analises",
      icon: <BarChart size={20} />,
      expanded: false,
    },
    {
      name: "Relatórios",
      path: "/relatorios",
      icon: <FileBarChart size={20} />,
      expanded: false,
    },
    {
      name: "Previsões",
      path: "/previsoes",
      icon: <TrendingUp size={20} />,
      expanded: false,
    },
    {
      name: "Metas",
      path: "/metas",
      icon: <Target size={20} />,
      expanded: false,
    },
    {
      name: "Alertas",
      path: "/alertas",
      icon: <Bell size={20} />,
      expanded: false,
    },
    {
      name: "Configurações",
      path: "/configuracoes",
      icon: <Settings size={20} />,
      expanded: false,
    },
  ];

  return (
    <div className="w-64 bg-fin-background border-r border-white/5 flex flex-col h-full">
      <div className="p-4 flex items-center">
        <div className="bg-fin-green rounded-full w-8 h-8 flex items-center justify-center mr-2 text-black font-bold">
          <span>X</span>
        </div>
        <span className="text-white text-xl font-bold">Fin</span>
      </div>

      <div className="overflow-y-auto flex-1 px-2 py-4">
        {menuItems.map((item) =>
          item.subItems ? (
            <Accordion
              key={item.name}
              type="single"
              collapsible
              defaultValue="movimentacoes"
              className="border-none"
            >
              <AccordionItem value="movimentacoes" className="border-b-0">
                <AccordionTrigger className="p-2 hover:bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3 text-fin-text-primary">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-10 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-fin-text-secondary",
                          isActive(subItem.path) && "bg-fin-green/10 text-fin-green"
                        )}
                      >
                        {subItem.icon}
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 mb-1 text-fin-text-secondary",
                isActive(item.path) && "bg-fin-green/10 text-fin-green"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          )
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-1">Precisa de ajuda?</h4>
          <p className="text-xs text-fin-text-secondary mb-3">
            Está com problemas com o Fin?
          </p>
          <button className="text-fin-green border border-fin-green text-xs py-1 px-3 rounded-lg w-full hover:bg-fin-green/10 transition-colors">
            Contate-nos
          </button>
        </div>
      </div>
    </div>
  );
};
