import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamePlaceholderProps {
    title: string;
    className?: string;
}

export function GamePlaceholder({ title, className }: GamePlaceholderProps) {
    return (
        <div className={cn(
            "w-full h-full relative overflow-hidden bg-muted flex items-center justify-center p-4 group",
            className
        )}>
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted to-muted-foreground/10 animate-gradient bg-[length:400%_400%]" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col items-center gap-3 text-center transition-transform duration-300 group-hover:scale-110">
                <div className="h-16 w-16 rounded-2xl bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-lg border border-border/50">
                    <Gamepad2 className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <p className="text-xs font-medium text-muted-foreground line-clamp-2 px-2 max-w-[120px]">
                    {title}
                </p>
            </div>
        </div>
    );
}
