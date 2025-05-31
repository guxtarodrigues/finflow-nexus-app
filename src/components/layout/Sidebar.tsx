import {
  LayoutDashboard,
  Settings,
  User,
  Calendar,
  CircleDollarSign,
  Package
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item"
import { useAuth } from "@/contexts/AuthContext"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Sidebar({ className, ...props }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Movimentações",
      href: "/movimentacoes",
      icon: CircleDollarSign,
      current: pathname === "/movimentacoes",
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: User,
      current: pathname === "/clientes",
    },
    {
      name: "Categorias",
      href: "/categorias",
      icon: Settings,
      current: pathname === "/categorias",
    },
    {
      name: "DRE",
      href: "/dre",
      icon: Calendar,
      current: pathname === "/dre",
    },
    {
      name: "Produtos",
      href: "/produtos", 
      icon: Package,
      current: pathname === "/produtos"
    }
  ]

  return (
    <div
      className="flex flex-col space-y-6 w-72 border-r border-zinc-900/50 dark:bg-zinc-950 dark:border-zinc-800"
      {...props}
    >
      <div className="flex-1">
        <MainNav className="px-6" />
        <SidebarNavItem items={navigation} />
      </div>
      <div className="flex-1 px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            logout()
            navigate("/login")
          }}
        >
          Sair
        </Button>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
