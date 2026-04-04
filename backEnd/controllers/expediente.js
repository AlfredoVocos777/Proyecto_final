import connection from "../configDB/dataBase.js";


// Obtener todos los expedientes — acepta ?estado=<valor> para filtrar
export const obtenerExpediente = (req, res) => {
  const { estado } = req.query;

  const whereClause = estado ? `WHERE e.estado_actual = ?` : "";
  const params = estado ? [estado] : [];

  const sql = `
    SELECT 
      e.*,
      u.nombre AS usuario_presentante_nombre,
      u.apellido AS usuario_presentante_apellido,
      u.telefono AS usuario_presentante_telefono,
      u.email AS usuario_presentante_email,
      COALESCE(ur.id_usuario, ut.id_usuario) AS usuario_asignado_id,
      COALESCE(ur.nombre, ut.nombre) AS usuario_asignado_nombre,
      COALESCE(ur.apellido, ut.apellido) AS usuario_asignado_apellido
    FROM expedientes e
    LEFT JOIN usuario u ON e.id_usuario_presentante = u.id_usuario
    LEFT JOIN (
      SELECT h1.id_expediente, h1.id_usuario_responsable, u2.nombre, u2.apellido, u2.id_usuario
      FROM historial_expediente h1
      INNER JOIN (
        SELECT id_expediente, MAX(fecha) AS max_fecha
        FROM historial_expediente
        WHERE LOWER(accion) LIKE '%recepcion%'
        GROUP BY id_expediente
      ) h2 ON h1.id_expediente = h2.id_expediente AND h1.fecha = h2.max_fecha
      LEFT JOIN usuario u2 ON h1.id_usuario_responsable = u2.id_usuario
    ) ur ON e.id_expediente = ur.id_expediente
    LEFT JOIN usuario ut ON e.id_profesional_asignado = ut.id_usuario
    ${whereClause}
    ORDER BY e.fecha_creacion DESC
  `;

  connection.query(sql, params, (err, results) => {
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
    estado_actual,
    id_profesional_asignado,
    comentario_director // Agregamos este campo que vendría del modal de React
  } = req.body;

  const updated_at = new Date();

  // Construir el objeto de actualización de forma dinámica
  // Solo se agregan al objeto los campos que vienen definidos en el body
  const expedienteUpdate = { updated_at };

  const camposPermitidos = [
    'tipo_expediente', 
    'descripcion', 
    'prioridad', 
    'estado_actual', 
    'id_profesional_asignado',
    'ubicacion'
  ];

  camposPermitidos.forEach(campo => {
    if (req.body[campo] !== undefined) {
      expedienteUpdate[campo] = req.body[campo];
    }
  });


  // 1. Actualizamos los datos en la DB
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


      // 2. Lógica de Notificación (Solo si es Aprobado o Rechazado)
      if (estado_actual === 'aprobado' || estado_actual === 'rechazado') {
        
        // Buscamos el teléfono y nombre del usuario que presentó el expediente
        const sqlDatos = `
          SELECT u.nombre, u.telefono, e.numero_expediente 
          FROM expedientes e
          JOIN usuario u ON e.id_usuario_presentante = u.id_usuario
          WHERE e.id_expediente = ?
        `;

        connection.query(sqlDatos, [id], (errTel, results) => {
          if (!errTel && results.length > 0 && results[0].telefono) {
            const { nombre, telefono, numero_expediente } = results[0];

            const emoji = estado_actual === 'aprobado' ? '✅' : '❌';
            const mensaje = `🏛️ *D.P.A. Tucumán*\n\n` +
                            `Hola *${nombre}*,\n` +
                            `Tu expediente *${numero_expediente}* ha sido *${estado_actual.toUpperCase()}* ${emoji}.\n\n` +
                            `💬 *Observación:* ${comentario_director || "Sin observaciones particulares."}\n\n` +
                            `_Este es un aviso automático_.\n\n Para más información, consulte al sistema.`;

            // LLAMADA SIMPLE: La utilidad se encarga de todo el formateo necesario para Tucumán (agregar 549, validar número, etc.)

            console.log(`📩 Notificación enviada a ${nombre} (${telefono})`);
          }
        });
      }

      // 3. Respuesta al frontend
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
// Obtener todos los expedientes finalizados (solo aprobados)
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
    WHERE e.estado_actual = 'aprobado'
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
  // Unificar: expedientes asignados al usuario técnico o donde fue último responsable
  const sql = `
    SELECT DISTINCT e.id_expediente,
           e.numero_expediente,
           e.tipo_expediente,
           e.descripcion,
           e.estado_actual,
           e.prioridad,
           e.fecha_creacion,
           e.id_profesional_asignado,
           u.nombre AS nombre_asignado,
           u.apellido AS apellido_asignado,
           up.nombre AS usuario_presentante_nombre,
           up.apellido AS usuario_presentante_apellido,
           up.telefono AS usuario_presentante_telefono,
           up.email AS usuario_presentante_email
    FROM expedientes e
    LEFT JOIN usuario u ON e.id_profesional_asignado = u.id_usuario
    LEFT JOIN usuario up ON e.id_usuario_presentante = up.id_usuario
    WHERE (
      e.id_profesional_asignado = ?
      OR e.id_expediente IN (
        SELECT h1.id_expediente
        FROM historial_expediente h1
        INNER JOIN (
          SELECT id_expediente, MAX(fecha) AS max_fecha
          FROM historial_expediente
          WHERE LOWER(accion) LIKE '%recepcion%'
          GROUP BY id_expediente
        ) h2 ON h1.id_expediente = h2.id_expediente AND h1.fecha = h2.max_fecha
        WHERE h1.id_usuario_responsable = ?
        AND LOWER(h1.accion) LIKE '%recepcion%'
      )
    )
    AND (e.estado_actual IS NULL OR e.estado_actual NOT IN ('aprobado', 'rechazado', 'archivado'))
    ORDER BY e.fecha_creacion DESC
  `;

  console.log("[SQL obtenerPasesPorUsuario] id_usuario:", id_usuario);
  console.log("[SQL obtenerPasesPorUsuario] QUERY:\n", sql);
  connection.query(sql, [id_usuario, id_usuario], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener expedientes asignados o últimos responsables:", err);
      return res.status(500).json({ error: "Error al obtener expedientes asignados o últimos responsables" });
    }
    console.log("[SQL obtenerPasesPorUsuario] RESULTADOS:", results);
    res.json(results);
  });
};
