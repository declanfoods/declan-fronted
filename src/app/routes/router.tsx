import { createBrowserRouter } from "react-router";
import { LandingRoute } from "@/app/features/landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingRoute />,
  }
]);