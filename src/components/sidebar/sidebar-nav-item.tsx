
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  current: boolean
}

interface SidebarNavItemProps {
  items: NavItem[]
}

export function SidebarNavItem({ items }: SidebarNavItemProps) {
  const navigate = useNavigate()

  return (
    <nav className="space-y-1 px-6">
      {items.map((item) => (
        <Button
          key={item.name}
          variant={item.current ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            item.current && "bg-fin-green/10 text-fin-green hover:bg-fin-green/20"
          )}
          onClick={() => navigate(item.href)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.name}
        </Button>
      ))}
    </nav>
  )
}
