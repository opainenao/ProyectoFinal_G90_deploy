import app from "./server.js";
//import express from "express";
//import cors from "cors";
//import dotenv from "dotenv";
//import authRoutes from "./routes/authRoutes.js";
//import userRoutes from "./routes/userRoutes.js";


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});

export default app;
