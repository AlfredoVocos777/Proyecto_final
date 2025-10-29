import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  loginUsuario,
} from "../controllers/usuarios.js";

const router = express.Router();

router.get("/", obtenerUsuarios);
router.post("/", crearUsuario);
router.post("/login", loginUsuario);

export default router;
