//import { pool } from "../bd/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { pool } from "../src/bd.js";

export const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const result = await pool.query(
      `SELECT * FROM usuarios WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const isOk = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isOk) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, fono, direccion, contrasena } = req.body;

    if (!username || !email || !contrasena) {
      return res
        .status(400)
        .json({ error: "username, email y contrasena son obligatorios" });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (username, email, fono, direccion, contrasena)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email`,
      [username, email, fono, direccion, hashed]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("REGISTER ERROR", error);
    res.status(500).json({ error: "Error registrando usuario" });
  }
};

export async function getUsuarios(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, username, email, fono, direccion FROM usuarios"
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

export async function getUsuarioById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, username, email, fono, direccion FROM usuarios WHERE id = $1",
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

export async function getPerfil(req, res) {
  res.json({
    id: req.user.id,
    email: req.user.email,
  });
}
