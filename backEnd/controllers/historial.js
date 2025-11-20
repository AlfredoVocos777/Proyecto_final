import connection from "../configDB/dataBase.js";

// Crear una nueva asignación en historial_expediente
export const crearAsignacion = (req, res) => {
  const {
    id_expediente,
    id_usuario_responsable,
    accion,
    comentario,
    tipo_accion = "asignación",
    id_departamento
  } = req.body;

  // Validación básica
  if (!id_expediente || !id_usuario_responsable) {
    return res.status(400).json({ 
      error: "Faltan datos requeridos: id_expediente e id_usuario_responsable" 
    });
  }

  const historialData = {
    id_expediente,
    fecha: new Date(),
    accion: accion || "Asignación de expediente",
    comentario: comentario || null,
    id_usuario_responsable,
    id_departamento: id_departamento || null,
    tipo_accion
  };

  const sql = "INSERT INTO historial_expediente SET ?";

  connection.query(sql, historialData, (err, result) => {
    if (err) {
      console.error("❌ Error al crear asignación:", err);
      return res.status(500).json({ error: "Error al crear la asignación" });
    }

    res.status(201).json({
      mensaje: "Asignación creada exitosamente",
      id_historial: result.insertId,
      asignacion: historialData
    });
  });
};

// Obtener historial de un expediente
export const obtenerHistorialExpediente = (req, res) => {
  const { id_expediente } = req.params;

  const sql = `
    SELECT 
      h.id_historial,
      h.id_expediente,
      h.id_usuario_responsable,
      h.id_departamento,
      h.fecha,
      h.accion,
      h.comentario,
      h.tipo_accion,
      u.nombre AS usuario_nombre,
      u.apellido AS usuario_apellido,
      d.nombre AS departamento_nombre
    FROM historial_expediente h
    LEFT JOIN usuario u ON h.id_usuario_responsable = u.id_usuario
    LEFT JOIN departamentos d ON h.id_departamento = d.id_departamento
    WHERE h.id_expediente = ?
    ORDER BY h.fecha DESC
  `;

  connection.query(sql, [id_expediente], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener historial:", err);
      return res.status(500).json({ error: "Error al obtener el historial" });
    }

    res.json(results);
  });
};

// Recepcionar un expediente asignado
export const recepcionarExpediente = (req, res) => {
  const {
    id_expediente,
    id_usuario_responsable,
    comentario,
    id_departamento
  } = req.body;

  // Validación básica
  if (!id_expediente || !id_usuario_responsable) {
    return res.status(400).json({ 
      error: "Faltan datos requeridos: id_expediente e id_usuario_responsable" 
    });
  }

  const historialData = {
    id_expediente,
    fecha: new Date(),
    accion: "Recepción de expediente",
    comentario: comentario || "Expediente recepcionado",
    id_usuario_responsable,
    id_departamento: id_departamento || null,
    tipo_accion: "revisión"
  };

  const sql = "INSERT INTO historial_expediente SET ?";

  connection.query(sql, historialData, (err, result) => {
    if (err) {
      console.error("❌ Error al recepcionar expediente:", err);
      return res.status(500).json({ error: "Error al recepcionar el expediente" });
    }

    res.status(201).json({
      mensaje: "Expediente recepcionado exitosamente",
      id_historial: result.insertId,
      recepcion: historialData
    });
  });
};
