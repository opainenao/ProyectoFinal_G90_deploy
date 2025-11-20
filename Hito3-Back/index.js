import app from "./server.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartsRoutes from "./routes/carts.js";
import kitsRoutes from "./routes/kits.js";
import ordersRoutes from "./routes/orders.js";


// Registrar rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/kits", kitsRoutes);
app.use("/api/orders", ordersRoutes);


app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenido a la API DeliChef" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});

export default app;
