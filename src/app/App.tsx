import { RouterProvider } from "react-router"

import { router } from "./routes"

import { InterestProvider } from "./contexts/InterestContext"

import { SiteSettingsProvider } from "./contexts/SiteSettingsContext"

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
      <InterestProvider>
        <SiteSettingsProvider>
          <RouterProvider router={router} />
        </SiteSettingsProvider>
      </InterestProvider>
    </div>
  )
}
