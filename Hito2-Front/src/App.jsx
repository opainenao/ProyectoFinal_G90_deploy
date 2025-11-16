import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import AppContent from "../sazonplanner/src/AppContent";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
