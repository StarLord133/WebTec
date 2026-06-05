import express from "express";
import fs from "node:fs/promises";
import { pool, initDb } from "./db.js";

const app = express();

// Permite leer cuerpos JSON (req.body) en POST/PUT.
app.use(express.json());

// CORS abierto: el juego de Unity (WebGL) puede correr en otro origen/puerto
// y necesita poder llamar a esta API. Para una práctica, permitimos todo.
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// Sirve el login web (carpeta public/).
app.use(express.static("public"));

// ---------- Endpoint existente ----------
app.get("/api/countries", async (req, res) => {
    try {
        const data = await fs.readFile("./countries.json", "utf-8");
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error al leer countries.json:", err);
        res.status(500).send("Error interno del servidor");
    }
});

// ---------- Login ----------
// POST /login  { username, password }  ->  { id, username, puntos }
// Valida contra la tabla usuarios. (Comparación en texto plano: práctica.)
app.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ error: "Faltan username o password." });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, username, puntos FROM usuarios WHERE username = ? AND password = ?",
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
        }

        // Devolvemos el ID (lo que el login usará para redirigir al juego).
        res.json(rows[0]);
    } catch (err) {
        console.error("Error en /login:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// ---------- Consultar puntos ----------
// GET /usuario/:id  ->  { id, username, puntos }
app.get("/usuario/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "ID inválido." });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, username, puntos FROM usuarios WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Error en GET /usuario/:id:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// ---------- Guardar puntaje ----------
// PUT /usuario/:id/puntos  { puntos }  ->  { id, username, puntos }
app.put("/usuario/:id/puntos", async (req, res) => {
    const id = Number(req.params.id);
    const { puntos } = req.body ?? {};

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "ID inválido." });
    }
    if (!Number.isInteger(puntos)) {
        return res.status(400).json({ error: "El campo 'puntos' debe ser un entero." });
    }

    try {
        const [result] = await pool.query(
            "UPDATE usuarios SET puntos = ? WHERE id = ?",
            [puntos, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const [rows] = await pool.query(
            "SELECT id, username, puntos FROM usuarios WHERE id = ?",
            [id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error("Error en PUT /usuario/:id/puntos:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

const PORT = process.env.PORT || 4000;

// Inicializamos la BD (crea tabla + siembra usuario) ANTES de escuchar.
initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ No se pudo inicializar la base de datos:", err);
        process.exit(1);
    });
