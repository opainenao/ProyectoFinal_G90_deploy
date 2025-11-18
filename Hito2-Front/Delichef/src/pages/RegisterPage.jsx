import React, { useState } from "react";
import axios from "axios";

export default function RegisterPage({ navigate }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        nombre,
        email,
        password
      });

      alert("Usuario registrado correctamente");
      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Error al registrar");
    }
  };

  return (
    <main className="container py-5">
      <h2>Crear cuenta</h2>

      <form onSubmit={handleSubmit} className="mt-4" style={{ maxWidth: "420px" }}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input 
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required 
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email" 
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password" 
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Registrarse
        </button>

        <button
          type="button"
          className="btn btn-link mt-3"
          onClick={() => navigate("/login")}
        >
          Ya tengo cuenta → Iniciar sesión
        </button>
      </form>
    </main>
  );
}
