// Iniciar validación OTP: genera OTP, lo guarda y lo envía por email (envío pendiente de implementar)
export const iniciarOTP = (req, res) => {
  const { id_firma, email_destino } = req.body;
  if (!id_firma || !email_destino) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  // Generar OTP de 6 dígitos
  const codigo_otp = Math.floor(100000 + Math.random() * 900000).toString();
  const fecha_envio_otp = new Date();
  // Guardar OTP y datos en la base
  const sql = `UPDATE firmas_digitales SET codigo_otp = ?, fecha_envio_otp = ?, email_destino = ?, otp_validado = 0 WHERE id_firma = ?`;
  connection.query(sql, [codigo_otp, fecha_envio_otp, email_destino, id_firma], (err, result) => {
    if (err) {
      console.error("Error al guardar OTP:", err);
      return res.status(500).json({ error: "Error al guardar OTP" });
    }
    // Aquí se debe enviar el email con el OTP (pendiente)
    res.json({ success: true, codigo_otp, message: "OTP generado y guardado. Envío de email pendiente." });
  });
};

// Validar OTP ingresado por el usuario
export const validarOTP = (req, res) => {
  const { id_firma, codigo_otp } = req.body;
  if (!id_firma || !codigo_otp) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  // Buscar la firma y comparar el OTP
  const sql = `SELECT * FROM firmas_digitales WHERE id_firma = ?`;
  connection.query(sql, [id_firma], (err, results) => {
    if (err) {
      console.error("Error al buscar firma para OTP:", err);
      return res.status(500).json({ error: "Error al validar OTP" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Firma no encontrada" });
    }
    const firma = results[0];
    if (firma.codigo_otp !== codigo_otp) {
      return res.status(401).json({ error: "Código OTP incorrecto" });
    }
    // Marcar como validado
    const fecha_validacion_otp = new Date();
    const updateSql = `UPDATE firmas_digitales SET otp_validado = 1, fecha_validacion_otp = ? WHERE id_firma = ?`;
    connection.query(updateSql, [fecha_validacion_otp, id_firma], (err2) => {
      if (err2) {
        console.error("Error al actualizar validación OTP:", err2);
        return res.status(500).json({ error: "Error al actualizar validación OTP" });
      }
      res.json({ success: true, message: "OTP validado correctamente" });
    });
  });
};
import connection from "../configDB/dataBase.js";

export const listarFirmas = (req, res) => {
  connection.query(
    `SELECT f.*, e.numero_expediente, e.asunto, 
     CONCAT(u.nombre, ' ', u.apellido) as nombre_usuario
     FROM firmas_digitales f
     LEFT JOIN expedientes e ON f.id_expediente = e.id_expediente
     LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
     ORDER BY f.fecha_firma DESC`,
    (err, results) => {
      if (err) {
        console.error("Error al obtener firmas:", err);
        return res.status(500).json({ error: "Error al obtener firmas" });
      }
      res.json(results);
    }
  );
};

export const obtenerFirmaPorId = (req, res) => {
  const { id } = req.params;
  connection.query(
    `SELECT f.*, e.numero_expediente, e.asunto, 
     CONCAT(u.nombre, ' ', u.apellido) as nombre_usuario
     FROM firmas_digitales f
     LEFT JOIN expedientes e ON f.id_expediente = e.id_expediente
     LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
     WHERE f.id_firma = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener firma:", err);
        return res.status(500).json({ error: "Error al obtener firma" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Firma no encontrada" });
      }
      res.json(results[0]);
    }
  );
};

export const crearFirma = (req, res) => {
  const { id_expediente, id_usuario, hash_documento, metodo_firma } = req.body;
  if (!id_expediente || !id_usuario) {
    return res.status(400).json({ error: "Faltan id_expediente y/o id_usuario" });
  }
  connection.query(
    "INSERT INTO firmas_digitales (id_expediente, id_usuario, hash_documento, metodo_firma) VALUES (?, ?, ?, ?)",
    [id_expediente, id_usuario, hash_documento || null, metodo_firma || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear firma digital:", err);
        return res.status(500).json({ error: "Error al crear firma digital" });
      }
      res.status(201).json({ mensaje: "Firma digital creada", id_firma: result.insertId });
    }
  );
};

export const actualizarFirma = (req, res) => {
  const { id } = req.params;
  const { id_expediente, id_usuario, hash_documento, metodo_firma } = req.body;
  
  if (!id_expediente || !id_usuario) {
    return res.status(400).json({ error: "Faltan id_expediente y/o id_usuario" });
  }
  
  connection.query(
    "UPDATE firmas_digitales SET id_expediente = ?, id_usuario = ?, hash_documento = ?, metodo_firma = ? WHERE id_firma = ?",
    [id_expediente, id_usuario, hash_documento || null, metodo_firma || null, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar firma:", err);
        return res.status(500).json({ error: "Error al actualizar firma" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Firma no encontrada" });
      }
      
      res.json({ mensaje: "Firma actualizada exitosamente" });
    }
  );
};

export const eliminarFirma = (req, res) => {
  const { id } = req.params;
  
  connection.query("DELETE FROM firmas_digitales WHERE id_firma = ?", [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar firma:", err);
      return res.status(500).json({ error: "Error al eliminar firma" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Firma no encontrada" });
    }
    
    res.json({ mensaje: "Firma eliminada exitosamente" });
  });
};

