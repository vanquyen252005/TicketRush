import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/root-layout";
import { HomePage } from "./pages/home-page";
import { EventDetailPage } from "./pages/event-detail-page";
import { CheckoutPage } from "./pages/checkout-page";
import { MyTicketsPage } from "./pages/my-tickets-page";
import { AdminLayout } from "./components/layouts/admin-layout";
import { AdminDashboard } from "./pages/admin/admin-dashboard";
import { AdminEventsPage } from "./pages/admin/admin-events-page";
import { AdminSeatBuilderPage } from "./pages/admin/admin-seat-builder-page";
import { AdminOrdersPage } from "./pages/admin/admin-orders-page";
import { AdminTransactionsPage } from "./pages/admin/admin-transactions-page";
import { AdminUsersPage } from "./pages/admin/admin-users-page";
import { AdminSettingsPage } from "./pages/admin/admin-settings-page";
import { NotFoundPage } from "./pages/not-found-page";
import { ProtectedRoute } from "./components/auth/protected-route";
import { AdminProtectedRoute } from "./components/auth/admin-protected-route";
import { AdminLoginPage } from "./pages/admin/admin-login-page";
import { UserInfoPage } from "./pages/user-info-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "event/:id", Component: EventDetailPage },
      { path: "checkout", Component: CheckoutPage },
      { 
        path: "my-tickets", 
        element: (
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        ) 
      },

      { 
        path: "profile", 
        element: (
          <ProtectedRoute>
            <UserInfoPage />
          </ProtectedRoute>
        ) 
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminDashboard },
      { path: "events", Component: AdminEventsPage },
      { path: "events/:id/seats", Component: AdminSeatBuilderPage },
      { path: "orders", Component: AdminOrdersPage },
      { path: "transactions", Component: AdminTransactionsPage },
      { path: "users", Component: AdminUsersPage },
      { path: "settings", Component: AdminSettingsPage },
      // User View Mode (Nested)
      { path: "view-home", Component: HomePage },
      { path: "view-tickets", Component: MyTicketsPage },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
