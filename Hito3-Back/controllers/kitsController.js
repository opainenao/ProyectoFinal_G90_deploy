import { pool } from '../src/bd.js';

export async function listKits(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM productos WHERE activo = true ORDER BY id');
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'BD error' });
  } finally {
    client.release();
  }
}

export async function getKit(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'BD error' });
  } finally {
    client.release();
  }
}

export async function createKit(req, res) {
  const client = await pool.connect();
  try {
    const { nombre, descripcion, categoria, precio, imagen_kit } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: "Nombre y precio son obligatorios" });
    }

    const result = await client.query(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, imagen_kit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, descripcion, categoria, precio, imagen_kit]
    );

    res.json(result.rows[0]);

  } catch (e) {
    console.error("Error creando kit:", e);
    res.status(500).json({ error: "BD error creando kit" });
  } finally {
    client.release();
  }
}

export async function updateKitStatus(req, res) {
  const { id } = req.params;
  const { activo } = req.body;

  try {
    await pool.query(
      "UPDATE productos SET activo = $1 WHERE id = $2",
      [activo, id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("Error update status:", e);
    res.status(500).json({ error: "BD error" });
  }
}
