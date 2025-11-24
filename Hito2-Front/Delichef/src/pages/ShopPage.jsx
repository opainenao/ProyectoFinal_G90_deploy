import React, { useState, useEffect,useContext  } from "react";
//import { KITS } from "../data/kits";
import axios from 'axios';
import KitCard from "../components/KitCard";
import { AuthContext } from "../context/AuthProvider";

const API_URL = import.meta.env.VITE_API_URL;

const ShopPage = ({ navigate }) => {

  // ⬅️ AQUÍ va useContext, dentro del componente
  const { user } = useContext(AuthContext);

   console.log("Usuario logueado:", user);

  const [kits, setKits] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);


const cleanCategory = (categoryName) => {
        if (!categoryName) return 'Sin Categoría';
        // 1. Convertir a mayúsculas para manejar inconsistencias
        let cleaned = categoryName.toUpperCase();
        
        // 2. Remover los sufijos 
        cleaned = cleaned.replace(' PREMIUM', '');
        cleaned = cleaned.replace(' GOURMET', '');
        cleaned = cleaned.replace(' OPCIONAL', '');
        

        return cleaned.charAt(0) + cleaned.slice(1).toLowerCase();
    };  

useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        setError(null);
        // GET al backend
        const response = await axios.get(`${API_URL}/api/kits`); 

        //MAPEO BD
        const formattedKits = response.data.map(kit => ({
            id: kit.id,
            name: kit.nombre,
            price: kit.precio,
            description: kit.descripcion,
            category: kit.categoria,
            img: kit.imagen_kit
         }));        

        //setKits(response.data);
        setKits(formattedKits);
      } catch (err) {
        console.error("Error al cargar kits:", err);
        setError("No se pudieron cargar las recetas. Intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);  

  const categories = [...new Set(kits.map((k) => cleanCategory(k.category)))];
  const filteredKits = selectedCategory
    ? kits.filter((kit) => cleanCategory(kit.category) === selectedCategory)
    : kits;



  return (
    <main className="container py-5">
      <h2 className="fw-bold mb-4 display-6">Catálogo de Kits Congelados</h2>
        {/* Botones visibles solo para ADMIN */}
        {user?.rol === "admin" && (
          <div className="mb-4 d-flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/admin/kits")}
            >
              Administrar Kits
            </button>

            <button
              className="btn btn-success btn-sm"
              onClick={() => navigate("/admin/kits/new")}
            >
              Agregar Nuevo Kit
            </button>
          </div>
)}

      <div className="row g-4">

        {/* Sidebar Filtro */}
        <aside className="col-lg-3">
          <div className="card p-3">
            <h5 className="fw-bold pb-2 border-bottom">Filtrar por</h5>
            <ul className="list-group">
              <li className="list-group-item p-0">
                <button
                  className={`btn w-100 text-start ${
                    !selectedCategory ? "btn-success text-white" : ""
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas las Categorías
                </button>
              </li>

              {categories.map((category) => (
                <li key={category} className="list-group-item p-0">
                  <button
                    className={`btn w-100 text-start ${
                      selectedCategory === category
                        ? "btn-success text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Galería de Kits */}
        <section className="col-lg-9">
          <div className="row g-4">

            {filteredKits.map((kit) => (
              <KitCard key={kit.id} kit={kit} navigate={navigate} />
            ))}
          </div>

          {filteredKits.length === 0 && (
            <p className="text-center text-muted mt-4">
              No hay kits disponibles en esta categoría.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default ShopPage;
