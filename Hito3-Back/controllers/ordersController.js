import { pool } from '../src/bd.js';

export async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM productos ORDER BY id');
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'BD error' });
  } finally {
    client.release();
  }
}

export async function getOrder(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'BD error' });
  } finally {
    client.release();
  }
}
