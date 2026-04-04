import connection from "../configDB/dataBase.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configurar filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, JPG y PNG.'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // Límite de 100MB
    }
});

// Subir un documento
export const subirDocumento = async (req, res) => {
    try {
        const { id_expediente, subido_por } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
        }

        const documento = {
            id_expediente,
            nombre_archivo: file.originalname,
            tipo: file.mimetype,
            ruta_archivo: file.path,
            fecha_subida: new Date(),
            subido_por,
            tamaño_archivo: file.size,
            hash_integridad: null // Aquí podrías implementar un hash del archivo si lo necesitas
        };

        const sql = 'INSERT INTO documentos SET ?';
        connection.query(sql, documento, (err, result) => {
            if (err) {
                console.error('Error al guardar documento en la base de datos:', err);
                return res.status(500).json({ error: 'Error al guardar el documento' });
            }

            res.status(201).json({
                mensaje: 'Documento subido exitosamente',
                id_documento: result.insertId,
                nombre_archivo: documento.nombre_archivo
            });
        });
    } catch (error) {
        console.error('Error al procesar la subida del archivo:', error);
        res.status(500).json({ error: 'Error al procesar el archivo' });
    }
};

// Obtener documentos de un expediente
export const obtenerDocumentosExpediente = (req, res) => {
    const { id_expediente } = req.params;

    const sql = `
      SELECT d.*, u.nombre AS subido_por_nombre, r.nombre AS rol_nombre
      FROM documentos d
      LEFT JOIN usuario u ON d.subido_por = u.id_usuario
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      WHERE d.id_expediente = ?
    `;
    connection.query(sql, [id_expediente], (err, results) => {
        if (err) {
            console.error('Error al obtener documentos:', err);
            return res.status(500).json({ error: 'Error al obtener los documentos' });
        }

        res.json(results);
    });
};

// Eliminar un documento
export const eliminarDocumento = (req, res) => {
    const { id_documento } = req.params;

    // Primero obtener la información del documento para eliminar el archivo físico
    const sqlSelect = 'SELECT ruta_archivo FROM Documentos WHERE id_documento = ?';
    connection.query(sqlSelect, [id_documento], (err, results) => {
        if (err) {
            console.error('Error al buscar documento:', err);
            return res.status(500).json({ error: 'Error al eliminar el documento' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const rutaArchivo = results[0].ruta_archivo;

        // Eliminar el registro de la base de datos
        const sqlDelete = 'DELETE FROM Documentos WHERE id_documento = ?';
        connection.query(sqlDelete, [id_documento], (err, result) => {
            if (err) {
                console.error('Error al eliminar documento de la base de datos:', err);
                return res.status(500).json({ error: 'Error al eliminar el documento' });
            }

            // Eliminar el archivo físico
            fs.unlink(rutaArchivo, (err) => {
                if (err) {
                    console.error('Error al eliminar archivo físico:', err);
                    // No devolvemos error aquí porque el registro ya se eliminó de la base de datos
                }

                res.json({ mensaje: 'Documento eliminado exitosamente' });
            });
        });
    });
};

// Subir múltiples documentos (solo archivos físicos, sin registrar en BD)
export const subirMultiplesDocumentos = async (req, res) => {
    try {
        const expedienteId = req.body.expedienteId || req.body.id_expediente || 0;
        const subido_por = req.body.subido_por || null;

        const files = req.files || [];
        if (!files.length) {
            return res.status(400).json({ error: 'No se han proporcionado archivos' });
        }

        // Solo guardamos info temporal (no en BD)
        const resultados = files.map(file => ({
            mensaje: 'Archivo temporal subido',
            id_documento: null, // No hay ID hasta el pago
            nombre_archivo: file.originalname,
            tipo: file.mimetype,
            ruta_archivo: file.path,
            tamaño_archivo: file.size,
            subido_por,
            id_expediente: expedienteId
        }));

        res.status(201).json({ resultados, errores: [] });
    } catch (error) {
        console.error('Error al procesar la subida múltiple de archivos:', error);
        res.status(500).json({ error: 'Error al procesar los archivos' });
    }
};

// Registrar documentos en BD después del pago confirmado
export const registrarDocumentosEnBD = async (expedienteId, archivosTemporales) => {
    if (!archivosTemporales || !archivosTemporales.length) return [];

    const resultados = [];
    
    for (const arch of archivosTemporales) {
        try {
            const documento = {
                id_expediente: expedienteId,
                nombre_archivo: arch.nombre_archivo,
                tipo: arch.tipo,
                ruta_archivo: arch.ruta_archivo,
                fecha_subida: new Date(),
                subido_por: arch.subido_por,
                tamaño_archivo: arch.tamaño_archivo,
                hash_integridad: null
            };

            await new Promise((resolve, reject) => {
                const sql = 'INSERT INTO Documentos SET ?';
                connection.query(sql, documento, (err, result) => {
                    if (err) {
                        console.error('Error al registrar documento:', err);
                        return reject(err);
                    }
                    resultados.push({
                        id_documento: result.insertId,
                        nombre_archivo: documento.nombre_archivo
                    });
                    resolve();
                });
            });
        } catch (err) {
            console.error('Error al insertar documento:', err);
        }
    }
    
    return resultados;
};


// este codigo pertenece al modal ver de la consulta del presentante para subir y ver documentos
// subir y registrar directamente en BD
export const subirYRegistrar = async (req, res) => {
    const { id_expediente, subido_por } = req.body;
    const files = req.files || [];

    if (!id_expediente)
        return res.status(400).json({ error: 'Falta el id_expediente' });

    if (!files.length)
        return res.status(400).json({ error: 'No se subieron archivos' });

    try {
        const resultados = [];

        for (const file of files) {
            const documento = {
                id_expediente,
                nombre_archivo: file.originalname,
                tipo: file.mimetype,
                ruta_archivo: file.path,
                fecha_subida: new Date(),
                subido_por,
                tamaño_archivo: file.size,
                hash_integridad: null
            };

            const result = await new Promise((resolve, reject) => {
                const sql = 'INSERT INTO Documentos SET ?';
                connection.query(sql, documento, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            resultados.push({
                id_documento: result.insertId,
                nombre: documento.nombre_archivo
            });
        }

        res.status(201).json({ resultados });

    } catch (error) {
        console.error("Error al subir y registrar documentos:", error);
        res.status(500).json({ error: "Error al registrar los documentos en BD" });
    }
};


// Ver un documento
export const verDocumento = (req, res) => {
    const { id_documento } = req.params;

    const sql = 'SELECT ruta_archivo FROM Documentos WHERE id_documento = ?';

    connection.query(sql, [id_documento], (err, results) => {
        if (err) {
            console.error("Error al buscar documento:", err);
            return res.status(500).json({ error: "Error al buscar el documento" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Documento no encontrado" });
        }

        let rutaArchivo = results[0].ruta_archivo;
        // Si la ruta es relativa, la unimos con la carpeta uploads
        if (!path.isAbsolute(rutaArchivo)) {
            rutaArchivo = path.join(__dirname, '../', rutaArchivo);
        }
        // Normalizar rutas para comparación multiplataforma
        const uploadsDir = path.resolve(path.join(__dirname, '../uploads'));
        const rutaNormalizada = path.resolve(rutaArchivo);
        if (!rutaNormalizada.startsWith(uploadsDir)) {
            return res.status(403).json({ error: 'Acceso denegado al archivo.' });
        }
        res.sendFile(rutaNormalizada);
    });
};

