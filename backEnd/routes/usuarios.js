import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  loginUsuario,
  eliminarUsuario,
  actualizarUsuario,
  obtenerUsuariosJuridicos
} from "../controllers/usuarios.js";

const router = express.Router();

router.get("/", obtenerUsuarios);
router.get("/juridicos", obtenerUsuariosJuridicos);
router.get("/:id", obtenerUsuarioPorId);
router.post("/", crearUsuario);
router.post("/login", loginUsuario);
router.delete("/:id", eliminarUsuario);
router.put("/:id", actualizarUsuario);

export default router;
