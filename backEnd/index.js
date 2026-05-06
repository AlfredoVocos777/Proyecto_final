import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import usuariosRoutes from "./routes/usuarios.js";
import tramiteRoutes from "./routes/tramite.js";
import expedienteRoutes from "./routes/expediente.js";
import documentosRoutes from "./routes/documentos.js";
import pagosRoutes from "./routes/pagos.js";
import rolesRoutes from "./routes/roles.js";
import permisosRoutes from "./routes/permisos.js";
import departamentosRoutes from "./routes/departamentos.js";
import notificacionRoutes from "./routes/notificacion.js";
import tiposTramiteRoutes from "./routes/tiposTramite.js";
import dotenv from 'dotenv';
dotenv.config();

import historialRoutes from "./routes/historial.js";
import observacionesRoutes from "./routes/observacion.js";
import recuperacionRoutes from "./routes/recuperacion.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 
  BLOQUE 1: CONFIGURACIÓN BÁSICA DE EXPRESS Y MIDDLEWARES
  Aquí inicializamos nuestra aplicación 'app' mediante Express.
  - cors(): Permite que el frontend (puerto 5173 por lo general en react) pueda hacer peticiones al backend sin ser bloqueado por políticas de navegador.
  - express.json(): Es un middleware vital; intercepta las peticiones que llegan en formato JSON y las convierte a objetos de JavaScript para que el código (req.body) pueda leerlos.
*/
const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* 
  BLOQUE 2: ENRUTAMIENTO PRINCIPAL (API REST)
  En lugar de escribir toda la lógica de cada URL en este mismo archivo,
  usamos 'app.use'. Esto delega cualquier petición que entre por '/expedientes' a su ruta específica.
  Esto garantiza que el proyecto sea modular y altamente escalable.
*/
// Rutas principales
app.use("/usuarios", usuariosRoutes);
app.use("/tramite", tramiteRoutes);
app.use("/expedientes", expedienteRoutes);

app.use("/api/documentos", documentosRoutes);

app.use("/api", pagosRoutes);
app.use("/api", recuperacionRoutes);
app.use("/api", notificacionRoutes);
app.use("/roles", rolesRoutes);
app.use("/permisos", permisosRoutes);
app.use("/departamentos", departamentosRoutes);

app.use("/historial", historialRoutes);
app.use("/pagos", pagosRoutes);
app.use("/observaciones", observacionesRoutes);
app.use("/tipos-tramite", tiposTramiteRoutes);


/* 
  BLOQUE 3: INICIALIZACIÓN DEL SERVIDOR
  El método .listen "enciende" el servidor en el puerto especificado.
  Queda constantemente escuchando nuevas peticiones del frontend.
*/
// servidor escuchando
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});