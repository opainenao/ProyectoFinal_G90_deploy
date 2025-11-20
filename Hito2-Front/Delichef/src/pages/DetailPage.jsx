import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
//import { KITS } from "../data/kits";
import { formatPrice } from "../utils/formatPrice";
import { CartContext } from "../context/CartProvider";

const API_URL = import.meta.env.VITE_API_URL;

export default function DetailPage({ navigate, selectedId }) {
  const { addToCart } = useContext(CartContext);

  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
        if (!selectedId) {
            setLoading(false);
            setError(true); // O maneja la redirección
            return;
        }

  //const kit = KITS.find((k) => String(k.id) === String(selectedId));
  console.log ("KIT DETAIL ->", kit);

  const fetchKit = async () => {
            try {
                setLoading(true);
                setError(false);
                // Llamada al endpoint: /api/kits/1
                const response = await axios.get(`${API_URL}/api/kits/${selectedId}`); 
                
                // Mapeo BD a la estructura del frontend
                const fetchedKit = response.data;
                const formattedKit = {
                    id: fetchedKit.id,
                    name: fetchedKit.nombre,
                    price: fetchedKit.precio,
                    description: fetchedKit.descripcion,
                    category: fetchedKit.categoria,
                    img: fetchedKit.imagen_kit 
                };

                setKit(formattedKit);
            } catch (err) {
                console.error("Error al cargar el kit:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchKit();
  }, [selectedId]); 

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <h2>Cargando detalles del kit...</h2>
      </main>
    );
  }

  if (error || !kit) {
    return (
      <main className="container py-5">
        <h2 className="text-danger">Producto no encontrado</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/shop")}>
          Volver
        </button>
      </main>
    );
  }

  const handleAdd = () => {
    addToCart(kit.id);
//    navigate("/cart");
  };



  return (
    <main className="container py-5">
      <button
        className="btn btn-link mb-4"
        onClick={() => navigate("/shop")}
      >
        ← Volver
      </button>

      <div className="row g-4">
        <div className="col-md-6">
          <img
            src={kit.img}
            alt={kit.name}
            className="img-fluid rounded"
            onError={(e) => (e.target.src = "https://placehold.co/600x400?text=Kit")}
          />
        </div>

        <div className="col-md-6">
          <h1>{kit.name}</h1>
          <p className="text-muted">{kit.description}</p>

          <h3 className="fw-bold mb-3">{formatPrice(kit.price)}</h3>

          <button className="btn btn-success" onClick={handleAdd}>
            Añadir al Carrito
          </button>
        </div>
      </div>
    </main>
  );
}
