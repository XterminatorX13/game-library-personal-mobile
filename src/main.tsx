import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupPWA } from "./setupPWA";

setupPWA();

createRoot(document.getElementById("root")!).render(
    <App />
);
