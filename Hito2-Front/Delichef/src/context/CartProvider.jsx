import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
//import { createContext, useEffect, useState, useContext } from "react";
//import { KITS } from "../data/kits";
import { AuthContext } from "./AuthProvider";

export const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL; //"http://localhost:4000"; 

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]); // Canntidad por id { kitId: quantity }
  //const [allKits, setAllKits] = useState([]); 
  //const [loadingKits, setLoadingKits] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/carts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const mapped = response.data.map((item) => ({
          id: item.id,
          productId: item.id_producto,
          name: item.nombre,
          img: item.imagen_kit,
          price: item.precio,
          quantity: item.cantidad,
        }));

        setCart(mapped);
      } catch (err) {
        console.error("Error cargando carrito:", err);
      }
    };

    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        `${API_URL}/api/carts`,
        { id_producto: productId, cantidad: quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // recargar carrito
      const response = await axios.get(`${API_URL}/api/carts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const mapped = response.data.map((item) => ({
        id: item.id,
        productId: item.id_producto,
        name: item.nombre,
        img: item.imagen_kit,
        price: item.precio,
        quantity: item.cantidad,
      }));

      setCart(mapped);
    } catch (err) {
      console.error("Error agregando al carrito", err);
    }
  };

  // Actualizar cantidad
  const updateQuantity = async (idItem, quantity) => {
    if (!quantity || quantity < 1) return;

    console.log("Enviando PUT a backend:", {
      idItem,
      cantidad: quantity,
    });

    try {
      await axios.put(
        `${API_URL}/api/carts/${idItem}`,
        { cantidad: quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCart((prev) =>
        prev.map((item) =>
          item.id === idItem ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Error actualizando ítem", err);
    }
  };

  // Eliminar ítem
  const removeFromCart = async (idItem) => {
    try {
      await axios.delete(`${API_URL}/api/carts/${idItem}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart((prev) => prev.filter((i) => i.id !== idItem));
    } catch (err) {
      console.error("Error eliminando ítem", err);
    }
  };

  // Limpiar carrito
  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/carts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart([]);
    } catch (err) {
      console.error("Error vaciando carrito", err);
    }
  };

  // Totales
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
