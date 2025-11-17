// controllers/pagoExpediente.js (Nueva lógica)

import connection from "../configDB/dataBase.js";

// Función centralizada para formalizar Expediente, Documentos y Pago
export const formalizarTramiteYPago = (req, res) => {
    // 1. Datos recibidos del Frontend
    const {
        expediente: datosExpediente, // Datos del formulario (tipo_expediente, descripcion, etc.)
        pago: datosPago,             // Datos del pago (monto, metodo_pago, referencia_pasarela)
        archivos: archivosTemporales  // IDs o rutas temporales de los archivos subidos
    } = req.body;

    console.log("Datos de archivos recibidos:", archivosTemporales);
    // Validación mínima del usuario
    const id_usuario = datosExpediente.id_usuario;
    if (!id_usuario) {
        return res.status(400).json({ error: "Falta el ID del usuario" });
    }

    // Usamos una transacción para asegurar que todo se guarde o nada se guarde
    connection.beginTransaction(async (err) => {
        if (err) return res.status(500).json({ error: "Error iniciando la transacción." });

        try {
            // --- 2. CREACIÓN Y GENERACIÓN DEL EXPEDIENTE (Genera numero_expediente y fecha_creacion) ---

            const year = new Date().getFullYear();

            // Lógica para obtener el último número y generar el nuevo (Mismo código que tenías)
            const sqlUltimo = `SELECT numero_expediente FROM expedientes WHERE numero_expediente LIKE '${year}/%' ORDER BY id_expediente DESC LIMIT 1`;
            const resultsUltimo = await new Promise((resolve, reject) => {
                connection.query(sqlUltimo, (err, results) => err ? reject(err) : resolve(results));
            });

            let nuevoNumero = 1;
            if (resultsUltimo.length > 0) {
                const ultimoNumero = resultsUltimo[0].numero_expediente.split("/")[1];
                nuevoNumero = parseInt(ultimoNumero) + 1;
            }

            const numeroFormateado = nuevoNumero.toString().padStart(4, "0");
            const numero_expediente = `${year}/${numeroFormateado}`;
            const fecha_creacion = new Date();

            const expedienteParaInsertar = {
                numero_expediente,
                fecha_creacion,
                estado_actual: 'en revisión',
                id_usuario_presentante: id_usuario,
                tipo_expediente: datosExpediente.tipo_expediente,
                descripcion: datosExpediente.descripcion,
                prioridad: datosExpediente.prioridad || 'media',
                ubicacion: datosExpediente.ubicacion,
                created_at: fecha_creacion,
                updated_at: fecha_creacion,
                confirmar_pago: 'pago confirmado'

            };

            const sqlInsertExp = `INSERT INTO Expedientes SET ?`;
            const resultExp = await new Promise((resolve, reject) => {
                connection.query(sqlInsertExp, expedienteParaInsertar, (err, result) => err ? reject(err) : resolve(result));
            });

            const idExpediente = resultExp.insertId;

            // --- 3. REGISTRO DEL PAGO ---

            const pagoParaInsertar = {
                id_expediente: idExpediente,
                id_usuario: id_usuario,
                monto: datosPago.monto,
                metodo_pago: datosPago.metodo_pago,
                estado_pago: 'confirmado',
                fecha_pago: fecha_creacion, // Misma fecha para simplicidad
                referencia_pasarela: datosPago.referencia_pasarela,
                //created_at: fecha_creacion
            };

            const sqlInsertPago = `INSERT INTO pagos SET ?`;
            await new Promise((resolve, reject) => {
                connection.query(sqlInsertPago, pagoParaInsertar, (err, result) => err ? reject(err) : resolve(result));
            });

            // --- 4. VINCULACIÓN DE DOCUMENTOS (Si hay archivos temporales) ---
            
            // Si tus documentos temporales tienen un 'id_documento_temporal' o 'ruta_temporal' 
            // esta lógica DEBE actualizar esos registros para asignarles el idExpediente
            if (archivosTemporales && archivosTemporales.length > 0) {
    
    // Itera sobre cada archivo subido temporalmente
    for (const arch of archivosTemporales) {
        
        // Objeto de datos listo para la inserción en la tabla 'documentos'
        const documentoParaInsertar = {
            id_expediente: idExpediente, // <-- Clave foránea
            nombre_archivo: arch.nombre_archivo,
            tipo: arch.tipo,
            ruta_archivo: arch.ruta_archivo, // <-- Ruta en /uploads
            fecha_subida: fecha_creacion,
            id_usuario: id_usuario, 
            // es una columna meramente indicativa para saber q subido por se le asigna 
            // el id_usuario y parezca mas entendible en la tabla
            subido_por: id_usuario,
            tamaño_archivo: arch.tamaño_archivo || 0,
            hash_integridad: arch.hash_integridad || null 
        };

        const sqlInsertDoc = `INSERT INTO documentos SET ?`;
        
        // Ejecuta el INSERT para el documento dentro de la transacción
        await new Promise((resolve, reject) => {
            connection.query(sqlInsertDoc, documentoParaInsertar, (err, result) => {
                if (err) {
                    console.error("❌ ERROR al insertar documento:", err);
                    return reject(err); // Esto causará el rollback
                }
                resolve(result);
            });
        });
        // Si la inserción falla para un documento, la transacción se revertirá, 
        // evitando que el expediente se cree sin sus documentos.
    }
}


            // --- 5. FIN DE LA TRANSACCIÓN ---
            connection.commit((err) => {
                if (err) {
                    connection.rollback(() => console.error("Rollback ejecutado"));
                    return res.status(500).json({ error: "Error al confirmar la transacción." });
                }

                res.status(201).json({
                    mensaje: "Trámite y Pago formalizados exitosamente",
                    id_expediente: idExpediente,
                    numero_expediente,
                    fecha_creacion,
                    expediente: expedienteParaInsertar
                });
            });

        } catch (error) {
            connection.rollback(() => {
                console.error("❌ Error en la transacción de pago y expediente:", error);
                res.status(500).json({ error: "Error al formalizar el trámite. Transacción revertida." });
            });
        }
    });
};