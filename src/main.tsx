import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"
import "./styles/index.css"
import { ConfirmProvider } from "./app/components/ui/confirm"
import { Toaster } from "./app/components/ui/sonner"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
    <Toaster />
  </React.StrictMode>,
)
