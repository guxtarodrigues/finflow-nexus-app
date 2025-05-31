
import { cn } from "@/lib/utils"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export function MainNav({ className, ...props }: MainNavProps) {
  return (
    <div className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <div className="font-bold text-lg text-fin-green">
        FinFlow
      </div>
    </div>
  )
}
