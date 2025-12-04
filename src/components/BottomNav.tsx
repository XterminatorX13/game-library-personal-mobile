import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, FolderHeart, User } from "lucide-react";
import { AddGameDialog } from "@/components/AddGameDialog";
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
                <div className="flex items-center justify-around h-14">
                    {NAV_ITEMS.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        const isCenter = index === 2; // Plus button

                        if (isCenter) {
                            return (
                                <div key={index} className="relative -top-3">
                                    <AddGameDialog onAddGame={onAddGame} />
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path + index}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
