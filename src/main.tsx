import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA Registration
import { registerSW } from 'virtual:pwa-register';

// One-time cache cleanup (removes bloated old caches)
import './lib/cacheCleanup';

const updateSW = registerSW({
    onNeedRefresh() { },
    onOfflineReady() { },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <App />
);
