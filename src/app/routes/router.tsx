import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/app/features/landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  }
]);