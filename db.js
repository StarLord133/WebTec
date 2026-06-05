import mysql from "mysql2/promise";
import fs from "node:fs";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error(
        "Falta DATABASE_URL en el .env. Copia .env.example a .env y pega tu cadena de conexión de Aiven."
    );
}

// Aiven exige SSL. Hay dos formas de configurarlo:
//   1) (Recomendado) Descargar el certificado CA de Aiven (ca.pem) y apuntar
//      DB_CA_CERT_PATH a su ruta. Así se valida la cadena de certificados.
//   2) Sin certificado CA: se acepta la conexión SSL sin validar el emisor
//      (rejectUnauthorized:false). Más simple, suficiente para una práctica.
let ssl;
if (process.env.DB_CA_CERT_PATH) {
    ssl = {
        ca: fs.readFileSync(process.env.DB_CA_CERT_PATH).toString(),
        rejectUnauthorized: true,
    };
} else {
    ssl = { rejectUnauthorized: false };
}

// Parseamos la cadena de conexión a mano para construir una config limpia.
// (El parámetro "?ssl-mode=REQUIRED" de la URL lo ignoramos: el SSL lo
// configuramos arriba con el objeto `ssl`.)
const dbUrl = new URL(process.env.DATABASE_URL);

export const pool = mysql.createPool({
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1), // quita el "/" inicial -> "defaultdb"
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
});

/**
 * Crea la tabla de usuarios si no existe y siembra el usuario de prueba.
 * Se ejecuta una vez al arrancar el servidor.
 */
export async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id       INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password TEXT        NOT NULL,
            puntos   INT         NOT NULL DEFAULT 0
        );
    `);

    // Usuario de prueba (oswaldo / 1234).
    // NOTA: la contraseña se guarda en TEXTO PLANO porque esta práctica solo
    // evalúa el flujo de conexión. En producción NUNCA hagas esto: usa un
    // hash (bcrypt/scrypt) y compara con su función de verificación.
    // INSERT IGNORE no hace nada si el username ya existe (clave UNIQUE).
    await pool.query(
        `INSERT IGNORE INTO usuarios (username, password, puntos) VALUES (?, ?, ?);`,
        ["oswaldo", "1234", 0]
    );

    console.log("✅ Tabla 'usuarios' lista (creada si no existía) y usuario de prueba sembrado.");
}
