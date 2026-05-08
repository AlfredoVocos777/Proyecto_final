import connection from './backEnd/configDB/dataBase.js';

connection.query("SELECT * FROM documentos LIMIT 1", (err, results) => {
    if (err) {
        console.error("Error:", err);
    } else if (results.length > 0) {
        console.log("Columnas encontradas:", Object.keys(results[0]));
    } else {
        console.log("La tabla está vacía, verificando estructura con DESCRIBE...");
        connection.query("DESCRIBE documentos", (err, results) => {
            if (err) console.error(err);
            else console.log("Estructura:", results.map(r => r.Field));
        });
    }
    setTimeout(() => process.exit(), 1000);
});
