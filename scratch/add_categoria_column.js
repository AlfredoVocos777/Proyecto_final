import connection from './backEnd/configDB/dataBase.js';

connection.query("ALTER TABLE documentos ADD COLUMN categoria VARCHAR(100)", (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("La columna 'categoria' ya existe.");
        } else {
            console.error("Error al añadir la columna:", err);
        }
    } else {
        console.log("Columna 'categoria' añadida exitosamente.");
    }
    process.exit();
});
