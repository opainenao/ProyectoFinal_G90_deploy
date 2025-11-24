import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import { uploadImageToCloudinary } from "../utils/subeImagenes";

const API_URL = import.meta.env.VITE_API_URL;

export default function NuevoKitPage({ navigate }) {
  const { user } = useContext(AuthContext);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const token = localStorage.getItem("token");

      let imagenUrl = "";

      // ⬆️ Subir imagen si el usuario seleccionó una
      if (imagen) {
        imagenUrl = await uploadImageToCloudinary(imagen);
      }

      await axios.post(
        `${API_URL}/api/kits`,
        {
          nombre,
          descripcion,
          categoria,
          precio: Number(precio),
          imagen_kit: imagenUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("Kit creado exitosamente ✔");
      setTimeout(() => navigate("/shop"), 1500);

    } catch (err) {
      console.error("Error creando kit:", err);
      setMsg("Error al crear el kit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="fw-bold mb-4">Agregar Nuevo Kit</h2>

      <div className="card p-4 shadow">
        <form onSubmit={submit}>

          <div className="mb-3">
            <label className="form-label">Nombre *</label>
            <input
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <input
              className="form-control"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Precio *</label>
            <input
              type="number"
              className="form-control"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>

            <div className="mb-3">
            <label className="form-label">Imagen del Kit *</label>
            <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImagen(e.target.files[0])}
                required
            />
            </div>

          <button disabled={loading} className="btn btn-success w-100">
            {loading ? "Guardando..." : "Guardar Kit"}
          </button>

          {msg && <p className="alert alert-info text-center mt-3">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
