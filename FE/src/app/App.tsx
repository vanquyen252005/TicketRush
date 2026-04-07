import { RouterProvider } from "react-router";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <CustomerAuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </CustomerAuthProvider>
  );
}
