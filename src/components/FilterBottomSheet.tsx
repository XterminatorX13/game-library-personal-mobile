
import { Drawer } from "vaul";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterBottomSheetProps {
    platformFilter: string;
    setPlatformFilter: (value: string) => void;
    platforms: string[];
    sortOrder: "newest" | "name" | "rating";
    setSortOrder: (value: "newest" | "name" | "rating") => void;
}

export function FilterBottomSheet({
    platformFilter,
    setPlatformFilter,
    platforms,
    sortOrder,
    setSortOrder,
}: FilterBottomSheetProps) {
    return (
        <Drawer.Root shouldScaleBackground>
            <Drawer.Trigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                    <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-zinc-900 flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 outline-none">
                    <div className="p-4 bg-zinc-900 rounded-t-[10px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-700 mb-8" />

                        <div className="max-w-md mx-auto space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4" /> Ordenar por
                                </h3>
                                <RadioGroup
                                    value={sortOrder}
                                    onValueChange={(v) => setSortOrder(v as any)}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    <div className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
                                        <RadioGroupItem value="newest" id="newest" />
                                        <Label htmlFor="newest" className="flex-1 cursor-pointer">Recentes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
                                        <RadioGroupItem value="name" id="name" />
                                        <Label htmlFor="name" className="flex-1 cursor-pointer">Nome (A-Z)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800">
                                        <RadioGroupItem value="rating" id="rating" />
                                        <Label htmlFor="rating" className="flex-1 cursor-pointer">Avaliação</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    🎮 Plataforma
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={platformFilter === "Todos" ? "default" : "outline"}
                                        onClick={() => setPlatformFilter("Todos")}
                                        className="justify-start"
                                    >
                                        Todas
                                    </Button>
                                    {platforms.map(p => (
                                        <Button
                                            key={p}
                                            variant={platformFilter === p ? "default" : "outline"}
                                            onClick={() => setPlatformFilter(p)}
                                            className="justify-start truncate"
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-800 mt-auto bg-zinc-900 pb-safe">
                        <Drawer.Close asChild>
                            <Button className="w-full h-12 text-base font-semibold rounded-xl">
                                Ver Resultados
                            </Button>
                        </Drawer.Close>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
