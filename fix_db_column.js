import connection from './backEnd/configDB/dataBase.js';

console.log("Verificando tabla documentos en base de datos 'sigedex'...");

connection.query("SHOW TABLES LIKE 'documentos'", (err, results) => {
    if (err) {
        console.error("Error al buscar tablas:", err);
        process.exit(1);
    }
    
    if (results.length === 0) {
        console.error("La tabla 'documentos' NO existe en 'sigedex'.");
        process.exit(1);
    }

    console.log("Tabla 'documentos' encontrada. Verificando columna 'categoria'...");

    connection.query("SHOW COLUMNS FROM documentos LIKE 'categoria'", (err, results) => {
        if (err) {
            console.error("Error al buscar columnas:", err);
            process.exit(1);
        }

        if (results.length > 0) {
            console.log("La columna 'categoria' YA existe.");
            process.exit(0);
        } else {
            console.log("La columna 'categoria' NO existe. Intentando añadirla...");
            connection.query("ALTER TABLE documentos ADD COLUMN categoria VARCHAR(100) NULL AFTER tamaño_archivo", (err, result) => {
                if (err) {
                    console.error("Error al añadir la columna:", err);
                    process.exit(1);
                }
                console.log("Columna 'categoria' añadida exitosamente.");
                process.exit(0);
            });
        }
    });
});
