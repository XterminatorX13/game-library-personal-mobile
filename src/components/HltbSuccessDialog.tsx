import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { HltbResult } from "@/services/hltb-service";

interface HltbSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: HltbResult | null;
}

export function HltbSuccessDialog({ open, onOpenChange, data }: HltbSuccessDialogProps) {
    const isMobile = useIsMobile();

    if (!data) return null;

    const Content = () => (
        <div className="flex flex-col gap-4">
            <div className="text-center space-y-4 pt-2">
                {!isMobile && (
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                        <Check className="h-6 w-6 text-green-500" />
                    </div>
                )}

                <div className="space-y-1">
                    {!isMobile && <h2 className="text-xl font-bold text-foreground">Dados HLTB Encontrados!</h2>}
                    <p className="text-sm text-muted-foreground">
                        Encontramos os tempos de jogo para <span className="font-medium text-foreground">"{data.gameName}"</span>:
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-foreground">{data.mainStory}h</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Main</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-foreground">{data.mainExtra}h</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">Extra</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-foreground">{data.completionist}h</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">100%</div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                            <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <DrawerTitle>Dados HLTB Encontrados!</DrawerTitle>
                        <DrawerDescription className="hidden">Confirmation details</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <Content />
                        <DrawerFooter className="pt-4 px-0">
                            <Button onClick={() => onOpenChange(false)}>Maravilha!</Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="hidden">
                    <DialogTitle>HLTB Found</DialogTitle>
                    <DialogDescription>HLTB Found</DialogDescription>
                </DialogHeader>
                <div className="p-2">
                    <Content />
                    <DialogFooter className="mt-6">
                        <Button className="w-full" onClick={() => onOpenChange(false)}>
                            Maravilha!
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
