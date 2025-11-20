import connection from "../configDB/dataBase.js";

// Obtener todos los expedientes (solo por si querés listar)
export const obtenerExpediente = (req, res) => {
  const sql = `
    SELECT 
      e.*,
      u.nombre AS usuario_nombre,
      u.apellido AS usuario_apellido
    FROM expedientes e
    LEFT JOIN usuario u ON e.id_usuario_presentante = u.id_usuario
    ORDER BY e.fecha_creacion DESC
  `;
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener expedientes:", err);
      return res.status(500).json({ error: "Error al obtener los expedientes" });
    }
    res.json(results);
  });
};

// Crear nuevo expediente
export const crearExpediente = (req, res) => {
  const {
    tipo_expediente,
    descripcion,
    prioridad = 'media',
    id_usuario_presentante
  } = req.body;

  // Validación básica
  if (!id_usuario_presentante) {
    return res.status(400).json({ error: "Falta el ID del usuario presentante" });
  }

  const year = new Date().getFullYear();

  // Buscar el último número de expediente del año actual
  const sqlUltimo = `
    SELECT numero_expediente 
    FROM expedientes 
    WHERE numero_expediente LIKE '${year}/%'
    ORDER BY id_expediente DESC 
    LIMIT 1
  `;

  connection.query(sqlUltimo, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener el último expediente:", err);
      return res.status(500).json({ error: "Error al generar número de expediente" });
    }

    let nuevoNumero = 1;
    if (results.length > 0) {
      const ultimoNumero = results[0].numero_expediente.split("/")[1];
      nuevoNumero = parseInt(ultimoNumero) + 1;
    }

    const numeroFormateado = nuevoNumero.toString().padStart(4, "0");
    const numero_expediente = `${year}/${numeroFormateado}`;
    const fecha_creacion = new Date();

    // Insertar el nuevo expediente
    const expediente = {
      numero_expediente,
      fecha_creacion,
      estado_actual: 'en revisión',
      id_usuario_presentante,
      tipo_expediente,
      descripcion,
      prioridad,
      created_at: fecha_creacion,
      updated_at: fecha_creacion
    };

    const sqlInsert = `
      INSERT INTO Expedientes SET ?
    `;

    connection.query(sqlInsert, expediente, (err, result) => {
      if (err) {
        console.error("❌ Error al crear expediente:", err);
        return res.status(500).json({ error: "Error al crear expediente" });
      }

      // Devolver los datos al frontend
      res.status(201).json({
        mensaje: "Expediente creado exitosamente",
        id_expediente: result.insertId,
        numero_expediente,
        fecha_creacion,
        expediente
      });
    });
  });
};

// Obtener un expediente específico por ID
export const obtenerExpedientePorId = (req, res) => {
  const { id } = req.params;
  
  connection.query(
    "SELECT * FROM expedientes WHERE id_expediente = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("❌ Error al obtener expediente:", err);
        return res.status(500).json({ error: "Error al obtener el expediente" });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }
      
      res.json(results[0]);
    }
  );
};

// Actualizar expediente
export const actualizarExpediente = (req, res) => {
  const { id } = req.params;
  const {
    tipo_expediente,
    descripcion,
    prioridad,
    estado_actual
  } = req.body;

  const updated_at = new Date();

  const expedienteUpdate = {
    tipo_expediente,
    descripcion,
    prioridad,
    estado_actual,
    updated_at
  };

  connection.query(
    "UPDATE Expedientes SET ? WHERE id_expediente = ?",
    [expedienteUpdate, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar expediente:", err);
        return res.status(500).json({ error: "Error al actualizar expediente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }

      res.json({
        mensaje: "Expediente actualizado exitosamente",
        id_expediente: id
      });
    }
  );
};

// Archivar expediente (cambiar estado a "archivado")
export const archivarExpediente = (req, res) => {
  const { id } = req.params;
  const updated_at = new Date();

  connection.query(
    "UPDATE Expedientes SET estado_actual = 'archivado', updated_at = ? WHERE id_expediente = ?",
    [updated_at, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error al archivar expediente:", err);
        return res.status(500).json({ error: "Error al archivar expediente" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }

      res.json({
        mensaje: "Expediente archivado exitosamente",
        id_expediente: id
      });
    }
  );
};

// Obtener expedientes con pase pendiente para un usuario (usando historial_expediente)
// Obtener todos los expedientes finalizados (aprobados o rechazados)
export const obtenerExpedientesFinalizados = (req, res) => {
  const sql = `
    SELECT 
      e.id_expediente,
      e.numero_expediente,
      e.descripcion,
      e.tipo_expediente,
      e.estado_actual,
      e.fecha_creacion,
      u.nombre AS usuario_nombre,
      u.apellido AS usuario_apellido
    FROM expedientes e
    LEFT JOIN usuario u ON e.id_usuario_presentante = u.id_usuario
    WHERE e.estado_actual IN ('aprobado', 'rechazado')
    ORDER BY e.fecha_creacion DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener expedientes finalizados:", err);
      return res.status(500).json({ error: "Error al obtener expedientes finalizados" });
    }
    res.json(results);
  });
};
export const obtenerPasesPorUsuario = (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      h.id_historial AS id_pase,
      h.fecha AS fecha_pase,
      h.comentario AS observaciones,
      e.id_expediente,
      e.numero_expediente,
      e.tipo_expediente,
      e.descripcion,
      e.estado_actual,
      e.prioridad,
      e.fecha_creacion,
      e.id_profesional_asignado,
      u.nombre AS nombre_asignado,
      u.apellido AS apellido_asignado,
      d.nombre AS departamento_actual
    FROM historial_expediente h
    INNER JOIN expedientes e ON h.id_expediente = e.id_expediente
    LEFT JOIN usuario u ON e.id_profesional_asignado = u.id_usuario
    LEFT JOIN departamentos d ON h.id_departamento = d.id_departamento
    WHERE h.id_usuario_responsable = ? 
      AND h.tipo_accion = 'asignación'
      AND e.estado_actual IN ('en revisión', 'aprobado')
    ORDER BY h.fecha DESC
  `;

  connection.query(sql, [id_usuario], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener pases del usuario:", err);
      return res.status(500).json({ error: "Error al obtener pases del usuario" });
    }
    res.json(results);
  });
};
