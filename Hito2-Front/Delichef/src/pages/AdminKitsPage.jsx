import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminKitsPage({ navigate }) {
  const { user } = useContext(AuthContext);
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      navigate("/");
      return;
    }
    loadKits();
  }, [user]);

  const loadKits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/kits`);
      setKits(response.data);
    } catch (e) {
      console.error("Error cargando kits:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentState) => {
    try {
      await axios.put(`${API_URL}/api/kits/${id}/estado`, {
        activo: !currentState,
      });
      loadKits();
    } catch (e) {
      alert("No se pudo actualizar el estado");
      console.error(e);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="fw-bold mb-4">Administrar Kits</h2>

      <button
        className="btn btn-success mb-4"
        onClick={() => navigate("/admin/kits/new")}
      >
        + Agregar Nuevo Kit
      </button>

      {loading ? (
        <h4>Cargando...</h4>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {kits.map((k) => (
                <tr key={k.id}>
                  <td>{k.id}</td>
                  <td>{k.nombre}</td>
                  <td>{k.categoria}</td>
                  <td>{k.precio}</td>
                  <td>{k.activo ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => navigate("/admin/kits/edit", k.id)}
                    >
                      Editar
                    </button>

                    <button
                      className={`btn btn-${k.activo ? "danger" : "secondary"} btn-sm`}
                      onClick={() => toggleActive(k.id, k.activo)}
                    >
                      {k.activo ? "Desactivar" : "Reactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
