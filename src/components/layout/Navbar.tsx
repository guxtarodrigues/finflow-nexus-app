
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <header className="border-b border-white/5 p-4 flex items-center justify-between bg-fin-background">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fin-text-secondary" size={18} />
        <Input
          placeholder="Search transactions..."
          className="pl-10 bg-white/5 border-transparent focus:border-fin-green"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell size={20} className="text-fin-text-secondary cursor-pointer hover:text-fin-text-primary transition-colors" />
          <span className="absolute -top-1 -right-1 bg-fin-green text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
            2
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-fin-green rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
            <span>JS</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold">John Smith</div>
            <div className="text-xs text-fin-text-secondary">Premium Account</div>
          </div>
        </div>
      </div>
    </header>
  );
};
