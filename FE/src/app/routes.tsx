import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/customer/Home";
import VirtualQueue from "./pages/customer/VirtualQueue";
import EventDetail from "./pages/customer/EventDetail";
import Checkout from "./pages/customer/Checkout";
import MyTickets from "./pages/customer/MyTickets";
import CustomerLogin from "./pages/customer/CustomerLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import EventManager from "./pages/admin/EventManager";
import SeatMatrixBuilder from "./pages/admin/SeatMatrixBuilder";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "queue/:eventId", Component: VirtualQueue },
      { path: "event/:eventId", Component: EventDetail },
      { path: "checkout", Component: Checkout },
      { path: "login", Component: CustomerLogin },
      { path: "my-tickets", Component: MyTickets },
      { path: "admin/login", Component: AdminLogin },
      { path: "admin/dashboard", Component: Dashboard },
      { path: "admin/events", Component: EventManager },
      { path: "admin/seat-builder/:eventId", Component: SeatMatrixBuilder },
      { path: "*", Component: NotFound },
    ],
  },
]);
