import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===============================
// RESERVAS
// ===============================
app.get("/reservas", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM reservas ORDER BY fecha ASC");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/reservas", async (req, res) => {
  try {
    const { fecha, proyecto, usuario, nombre, nota, estado } = req.body;

    const r = await pool.query(
      `INSERT INTO reservas (fecha, proyecto, usuario, nombre, nota, estado)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [fecha, proyecto, usuario, nombre, nota, estado]
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/reservas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await pool.query(
      "UPDATE reservas SET estado=$1 WHERE id=$2",
      [estado, id]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/reservas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM reservas WHERE id=$1", [id]);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// PASSWORDS
// ===============================
app.get("/passwords/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const r = await pool.query(
      "SELECT * FROM passwords WHERE username=$1",
      [username]
    );

    res.json(r.rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/passwords", async (req, res) => {
  try {
    const { username, password } = req.body;

    await pool.query(
      `INSERT INTO passwords (username, password, first_login)
       VALUES ($1,$2,false)
       ON CONFLICT (username)
       DO UPDATE SET password=$2, first_login=false`,
      [username, password]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
