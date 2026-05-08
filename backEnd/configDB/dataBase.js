import mysql from 'mysql2';

/* 
  BLOQUE 1: Creación del Pool de conexiones a MySQL.
  Utilizamos un Pool en lugar de una conexión única para evitar cierres inesperados por timeout.
  - connectionLimit: Cantidad máxima de conexiones simultáneas.
*/
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Alfredvocos777',
    database: 'sigedex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false },
});

// Exportamos el pool directamente. mysql2 permite usar .query() sobre el pool igual que sobre una conexión.
const connection = pool;

/*
  BLOQUE 2: Verificación de disponibilidad.
  Intentamos obtener una conexión para asegurar que las credenciales y el host son correctos.
*/
pool.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Error al conectar al Pool de la base de datos:', err);
        return;
    }
    console.log('✅ Pool de conexiones MySQL (SIGEDEX) inicializado correctamente');
    conn.release(); // Importante liberar la conexión de prueba
});

export default connection;