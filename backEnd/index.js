import express from "express";
import cors from "cors";
import usuariosRoutes from "./routes/usuarios.js";
import tramiteRoutes from "./routes/tramite.js";
import expedienteRoutes from "./routes/expediente.js";
const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/usuarios", usuariosRoutes);
app.use("/tramite", tramiteRoutes);
app.use("/expediente", expedienteRoutes);

// servidor escuchando
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
