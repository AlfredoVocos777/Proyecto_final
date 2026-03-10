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

// import firmasRoutes from "./routes/firmas.js";
import historialRoutes from "./routes/historial.js";
import observacionesRoutes from "./routes/observacion.js";
import recuperacionRoutes from "./routes/recuperacion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas principales
app.use("/usuarios", usuariosRoutes);
app.use("/tramite", tramiteRoutes);
app.use("/expedientes", expedienteRoutes);
app.use("/expedientes/documentos", documentosRoutes);
app.use("/api", pagosRoutes);
app.use("/api", recuperacionRoutes);
app.use("/roles", rolesRoutes);
app.use("/permisos", permisosRoutes);
app.use("/departamentos", departamentosRoutes);

app.use("/historial", historialRoutes);
app.use("/pagos", pagosRoutes);
app.use("/observaciones", observacionesRoutes);


// servidor escuchando
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
