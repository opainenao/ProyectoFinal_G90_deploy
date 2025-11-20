import React, { createContext, useState, useEffect } from "react";
//import { KITS } from "../data/kits";
import axios from "axios";

export const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({}); // Canntidad por id { kitId: quantity }
  const [allKits, setAllKits] = useState([]); 
  const [loadingKits, setLoadingKits] = useState(true);
  
  useEffect(() => {
    const fetchKits = async () => {
    
    try {
        const response = await axios.get(`${API_URL}/api/kits`);  
        const formattedKits = response.data.map(kit => ({
          id: kit.id,
          price: kit.precio,
          name: kit.nombre,
          descripcion: kit.descripcion,
          category: kit.categoria,
          img: kit.imagen_kit
      }));
    
      setAllKits(formattedKits);
    } catch (err) {
      console.error("Error al cargar kits en CartProvider:",err);
    } finally {
      setLoadingKits(false);
  }
};
fetchKits();
},[]); 

  const cartTotal = Object.entries(cartItems).reduce(
    (total, [kitId, qty]) => {
      const kit = allKits.find((k) => String(k.id) === String(kitId));
      return total + (kit ? kit.price * qty : 0);
    },
    0
  );

  const cartCount = Object.values(cartItems).reduce(
    (acc, q) => acc + q,
    0
  );

  // ✅ FIX
  const addToCart = (id) =>
    setCartItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

  const updateQuantity = (kitId, newQuantity) => {
    if (newQuantity <= 0) removeFromCart(kitId);
    else
      setCartItems((prev) => ({
        ...prev,
        [kitId]: newQuantity,
      }));
  };

  const removeFromCart = (kitId) =>
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[kitId];
      return updated;
    });

  const clearCart = () => setCartItems({});

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
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
