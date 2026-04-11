import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/root-layout";
import { HomePage } from "./pages/home-page";
import { EventDetailPage } from "./pages/event-detail-page";
import { CheckoutPage } from "./pages/checkout-page";
import { MyTicketsPage } from "./pages/my-tickets-page";
import { LoginPage } from "./pages/login-page";
import { OAuth2CallbackPage } from "./pages/oauth2-callback-page";
import { AdminLayout } from "./components/layouts/admin-layout";
import { AdminDashboard } from "./pages/admin/admin-dashboard";
import { AdminEventsPage } from "./pages/admin/admin-events-page";
import { AdminSeatBuilderPage } from "./pages/admin/admin-seat-builder-page";
import { NotFoundPage } from "./pages/not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "event/:id", Component: EventDetailPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "my-tickets", Component: MyTicketsPage },
      { path: "login", Component: LoginPage },
      { path: "oauth2/callback", Component: OAuth2CallbackPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "events", Component: AdminEventsPage },
      { path: "events/:id/seats", Component: AdminSeatBuilderPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
