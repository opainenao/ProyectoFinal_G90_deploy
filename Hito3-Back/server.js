import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import { pool } from "./src/bd.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL

const app = express();
app.use(cors({
  origin: FRONTEND_URL, //'http://localhost:5174',  
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API Online");
});

const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Servidor activo en http://localhost:${PORT}`));

export default app;

