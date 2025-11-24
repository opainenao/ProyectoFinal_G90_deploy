import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartProvider";

const API_URL = import.meta.env.VITE_API_URL;

const CheckoutConfirm = ({ navigate }) => {
  const { user } = useContext(AuthContext);
  const { clearCart, cartTotal } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleCreateOrder = async () => {
    setLoading(true);
    setMsg("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/orders`,
        {}, // el backend toma los productos desde carrito_item
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // limpiar carrito del contexto
      clearCart();

      setMsg("Pedido creado con éxito. Redirigiendo...");

      setTimeout(() => navigate("/profile"), 1000);

    } catch (error) {
      console.error("Error creando pedido:", error);
      setMsg("Error procesando el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="fw-bold mb-4">Confirmar Compra</h2>

      <div className="card p-4 shadow">
        <p className="fs-5">
          Total a pagar: <strong>${cartTotal}</strong>
        </p>

        <button
          onClick={handleCreateOrder}
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Creando Pedido..." : "Confirmar Pedido"}
        </button>

        {msg && <p className="alert alert-info text-center mt-3">{msg}</p>}
      </div>
    </main>
  );
};

export default CheckoutConfirm;
