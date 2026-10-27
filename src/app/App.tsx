import { RouterProvider } from "react-router";
import { router } from "./routes";
import { InterestProvider } from "./contexts/InterestContext";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
      <InterestProvider>
        <RouterProvider router={router} />
      </InterestProvider>
    </div>
  );
}
