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

    // Actualizar el campo id_profesional_asignado y estado_actual en la tabla expedientes
    if (tipo_accion === "asignación") {
      connection.query(
        "UPDATE expedientes SET id_profesional_asignado = ?, estado_actual = 'asignado' WHERE id_expediente = ?",
        [id_usuario_responsable, id_expediente],
        (err2) => {
          if (err2) {
            console.error("❌ Error al actualizar id_profesional_asignado:", err2);
          }
        }
      );
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
      r.nombre AS rol_nombre,
      d.nombre AS departamento_nombre
    FROM historial_expediente h
    LEFT JOIN usuario u ON h.id_usuario_responsable = u.id_usuario
    LEFT JOIN roles r ON u.id_rol = r.id_rol
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

    // Actualizar estado_actual a 'en revisión' al recepcionar
    connection.query(
      "UPDATE expedientes SET estado_actual = 'en revisión' WHERE id_expediente = ?",
      [id_expediente],
      (err2) => {
        if (err2) {
          console.error("❌ Error al actualizar estado_actual:", err2);
        }
      }
    );

    res.status(201).json({
      mensaje: "Expediente recepcionado exitosamente",
      id_historial: result.insertId,
      recepcion: historialData
    });
  });
};

// Deshacer el último pase de un expediente
export const deshacerPase = (req, res) => {
  const { id_expediente } = req.params;

  // 1. Encontrar los últimos registros en historial para restaurar el estado anterior
  const sqlBuscar = `
    SELECT id_historial, id_usuario_responsable, accion, tipo_accion
    FROM historial_expediente
    WHERE id_expediente = ?
    ORDER BY fecha DESC
    LIMIT 2
  `;

  connection.query(sqlBuscar, [id_expediente], (err, results) => {
    if (err) {
      console.error("❌ Error al buscar el historial:", err);
      return res.status(500).json({ error: "Error al buscar el historial para deshacer" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "No se encontró historial para este expediente" });
    }

    const ultimoPase = results[0];
    const registroAnterior = results.length > 1 ? results[1] : null;

    // 2. Eliminar el registro del pase
    connection.query(
      "DELETE FROM historial_expediente WHERE id_historial = ?",
      [ultimoPase.id_historial],
      (err2) => {
        if (err2) {
          console.error("❌ Error al eliminar el pase:", err2);
          return res.status(500).json({ error: "Error al eliminar el pase" });
        }

        // 3. Revertir el estado del expediente
        // El nuevo responsable es el del registro previo al que borramos
        const id_nuevo_responsable = registroAnterior ? registroAnterior.id_usuario_responsable : null;
        
        // Si el anterior registro era una recepción, el estado vuelve a 'en revisión'
        // De lo contrario, queda en 'asignado'
        const nuevo_estado = (registroAnterior?.accion?.toLowerCase().includes('recep')) ? 'en revisión' : 'asignado';

        connection.query(
          "UPDATE expedientes SET estado_actual = ?, id_profesional_asignado = ?, updated_at = NOW() WHERE id_expediente = ?",
          [nuevo_estado, id_nuevo_responsable, id_expediente],
          (err3) => {
            if (err3) {
              console.error("❌ Error al revertir expediente:", err3);
              return res.status(500).json({ error: "Error al revertir el expediente" });
            }

            // 4. Registrar la anulación en historial
            connection.query(
              `INSERT INTO historial_expediente (id_expediente, fecha, accion, comentario, tipo_accion)
               VALUES (?, NOW(), 'Pase anulado', 'El pase fue revertido', 'revisión')`,
              [id_expediente],
              () => {
                res.json({ mensaje: "Pase deshecho correctamente" });
              }
            );
          }
        );
      }
    );
  });
};
