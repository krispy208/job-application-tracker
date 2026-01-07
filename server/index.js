import express from "express";
import { pool } from "./db.js"


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "You made it" })
});

app.get("/health", (req, res) => {
  res.json({ status: "still alive" });
});

app.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, company, role, status, link, notes, created_at FROM applications ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



app.put("/applications/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { company, role, status, link, notes } = req.body;

    const result = await pool.query(
      `UPDATE applications
       SET company = COALESCE($1, company),
           role    = COALESCE($2, role),
           status  = COALESCE($3, status),
           link    = COALESCE($4, link),
           notes   = COALESCE($5, notes)
       WHERE id = $6
       RETURNING id, company, role, status, link, notes, created_at`,
      [company ?? null, role ?? null, status ?? null, link ?? null, notes ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


app.post("/applications", async (req, res) => {
  try {
    const { company, role, status, link, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: "Company and role are required" });
    }

    const result = await pool.query(
      `INSERT INTO applications (company, role, status, link, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, company, role, status, link, notes, created_at`,
      [company, role, status ?? "applied", link ?? "", notes ?? ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


app.delete("/applications/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const result = await pool.query("DELETE FROM applications WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
})