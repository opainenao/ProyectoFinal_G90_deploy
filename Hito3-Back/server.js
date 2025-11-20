import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import { pool } from "./src/bd.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5174',   // hay que restringir antes de entregar
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

