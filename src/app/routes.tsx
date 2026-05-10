import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Home } from "./pages/Home";
import { Animals } from "./pages/Animals";
import { AnimalDetail } from "./pages/AnimalDetail";
import { Interest } from "./pages/Interest";
import { Admin } from "./pages/Admin";
import { Contact } from "./pages/Contact";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "animais", Component: Animals },
      { path: "animais/:id", Component: AnimalDetail },
      { path: "interesse/:id", Component: Interest },
      { path: "contato", Component: Contact },
      { path: "admin", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);
