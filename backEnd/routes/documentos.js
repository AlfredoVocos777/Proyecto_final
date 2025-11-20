
import connection from "../configDB/dataBase.js";

import express from 'express';
import {
    subirDocumento,
    subirMultiplesDocumentos,
    obtenerDocumentosExpediente,
    eliminarDocumento,
    upload,
    verDocumento,
    subirYRegistrar
} from '../controllers/documentos.js';

const router = express.Router();

// Ruta para subir un documento
router.post('/', upload.single('archivo'), subirDocumento);

// Ruta para subir múltiples documentos
router.post('/upload', upload.array('files'), subirMultiplesDocumentos);

// Ruta para obtener documentos de un expediente
router.get('/expediente/:id_expediente', obtenerDocumentosExpediente);

// Ruta para eliminar un documento
router.delete('/:id_documento', eliminarDocumento);

// Ruta para subir y registrar directamente en BD desde el modal ver del presentante
router.post('/subirYRegistrar', upload.array('files'), subirYRegistrar);
    
// Ruta para ver/descargar un documento desde el modal ver del presentante
router.get("/ver/:id_documento", verDocumento);

export default router;