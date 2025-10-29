import express from "express";
import {
  obtenerTramites,
  crearTramite,
 
} from "../controllers/tramite.js";

const router = express.Router();

router.get("/", obtenerTramites);
router.post("/", crearTramite);

export default router;
