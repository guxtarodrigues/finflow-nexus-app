
import React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface BlurModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function BlurModal({ 
  open, 
  onOpenChange, 
  children,
  className 
}: BlurModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "bg-black/40 backdrop-blur-[45px] border border-white/10 shadow-xl",
          className
        )}>
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn(
        "bg-black/40 backdrop-blur-[45px] border-t border-white/10 shadow-xl",
        className
      )}>
        <div className="px-4 pb-8 pt-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
