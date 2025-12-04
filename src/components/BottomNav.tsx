import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, Plus, FolderHeart, User } from "lucide-react";
import { AddGameDialog } from "@/components/AddGameDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Temporarily all point to / until we create those pages
const NAV_ITEMS = [
    { icon: Home, label: "Biblioteca", path: "/" },
    { icon: Search, label: "Buscar", path: "/search" },
    { icon: Plus, label: "Adicionar", path: "#add" }, // Special case
    { icon: FolderHeart, label: "Listas", path: "/collections" },
    { icon: User, label: "Perfil", path: "/profile" },
];

export function BottomNav({ onAddGame }: { onAddGame: (game: any) => void }) {
    const location = useLocation();
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-md md:hidden">
            {/* Safe area for iOS */}
            <div className="pb-safe">
                <div className="grid grid-cols-5 h-14 items-center">
                    {NAV_ITEMS.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        const isCenter = index === 2; // Plus button

                        if (isCenter) {
                            return (
                                <div key={index} className="relative w-full h-full flex items-center justify-center">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                        <AddGameDialog
                                            onAddGame={onAddGame}
                                            trigger={
                                                <Button
                                                    size="icon"
                                                    className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all border-4 border-background active:scale-95"
                                                >
                                                    <Plus className="h-7 w-7" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <motion.div
                                key={item.path + index}
                                className="w-full h-full flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
