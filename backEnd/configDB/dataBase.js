import mysql from 'mysql2';

/* 
  BLOQUE 1: Creación de la conexión a MySQL.
  Utilizamos 'mysql2' porque es más rápido, seguro y soporta Promesas o querys estándar.
  Aquí se definen los parámetros críticos como el host, usuario, y el nombre de la BD 'sigedex'.
  También se agrega 'ssl: { rejectUnauthorized: false }' para permitir conexiones a servidores con certificados auto-firmados o sin validación estricta (muy común en VPS).
*/
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Alfredvocos777', // Contraseña de tu entorno local
    database: 'sigedex',
    ssl: { rejectUnauthorized: false },
});

/*
  BLOQUE 2: Inicialización de la conexión.
  Al ejecutar connection.connect(), verificamos inmediatamente si hay un error de red o credenciales.
  Si falla, arrojamos un error en consola. Si es exitoso, significa que el backend ya puede operar con la db.
*/
connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos MySQL (SIGEDEX)');
});

/*
  BLOQUE 3: Exportación del módulo.
  Al exportar 'connection', permitimos que cualquier controlador (ej. expedientes, usuarios)
  en todo el proyecto use esta MÍSMA INSTANCIA de conexión, sin abrir una nueva a cada rato.
*/
export default connection;