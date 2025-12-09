import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

export function setupPWA() {
    const updateSW = registerSW({
        onNeedRefresh() {
            toast.info("Nova versão disponível!", {
                description: "Atualize para ver as novidades.",
                action: {
                    label: "Atualizar",
                    onClick: () => {
                        updateSW(true);
                    }
                },
                duration: Infinity, // Keep open until action
            });
        },
        onOfflineReady() {
            toast.success("Pronto para uso offline!", {
                description: "O App funcionará mesmo sem internet.",
                duration: 3000,
            });
        },
    });
}
