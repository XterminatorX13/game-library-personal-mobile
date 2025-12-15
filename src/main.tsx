import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA Registration
import { registerSW } from 'virtual:pwa-register';

import { toast } from "sonner";

const updateSW = registerSW({
    onNeedRefresh() {
        toast.info("Nova versão disponível!", {
            action: {
                label: "Atualizar",
                onClick: () => updateSW(true),
            },
            duration: Infinity,
        });
    },
    onOfflineReady() {
        toast.success("App pronto para uso offline!");
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <App />
);
