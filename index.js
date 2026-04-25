import express from "express";
import fs from "node:fs/promises";

const app = express();
app.use(express.static("public"));


app.get("/api/countries", async (req, res) => {
    try {
        const data = await fs.readFile("./countries.json", "utf-8");
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error al leer countries.json:", err);
        res.status(500).send("Error interno del servidor");
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

