import React, { useState, useEffect } from "react";
import axios from "axios";
//import { KITS } from "../data/kits";
import Header from "../components/Header";
import KitCard from "../components/KitCard";

const API_URL = import.meta.env.VITE_API_URL

const HomePage = ({ navigate }) => {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);

        // Llamada 
        const response = await axios.get(`${API_URL}/api/kits`); 
        
        // Mapeo BD
        const formattedKits = response.data.map(kit => ({
            id: kit.id,
            name: kit.nombre,
            price: kit.precio,
            description: kit.descripcion,
            category: kit.categoria,
            img: kit.imagen_kit 
        }));

        setKits(formattedKits);
      } catch (err) {
        console.error("Error al cargar kits:", err);
        setError("Error al cargar las recetas desde el servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []); 

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <h2>Cargando kits de la BD...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5 text-center">
        <h2 className="text-danger">{error}</h2>
      </main>
    );
  }

  return (
  <>
    <Header />

    <main className="container py-5">
      <h2 className="text-center fw-bold mb-4 display-6">
        Explora la Semana Sin Estrés
      </h2>

      <div className="row justify-content-center">
        {kits.slice(0, 3).map((kit) => (
          <KitCard key={kit.id} kit={kit} navigate={navigate} />
        ))}
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/shop")}
          className="btn btn-primary btn-lg shadow"
        >
          Ver Catálogo Completo
        </button>
      </div>
    </main>
  </>
);
};

export default HomePage;
