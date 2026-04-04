// observaciones.js
import connection from "../configDB/dataBase.js";


// ---------------------------------------------------------------------
// 1) CREAR OBSERVACIÓN
// ---------------------------------------------------------------------
export const crearObservacion = (req, res) => {
  const { id_expediente, id_usuario, observacion } = req.body;

  if (!id_expediente || !id_usuario || !observacion?.trim()) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const sqlInsert = `
    INSERT INTO observaciones 
      (id_expediente, id_usuario, observacion, rol, fecha_hora, estado, created_at, updated_at)
    SELECT ?, ?, ?,
      CASE r.nombre
        WHEN 'Administrativo' THEN 'admin'
        WHEN 'Técnico'        THEN 'tecnico'
        WHEN 'Jurídico'       THEN 'juridico'
        WHEN 'Director'       THEN 'director'
        ELSE 'admin'
      END,
      NOW(), 'pendiente', NOW(), NOW()
    FROM usuario u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = ?
  `;

  connection.query(
    sqlInsert,
    [id_expediente, id_usuario, observacion, id_usuario],
    (err, result) => {
      if (err) {
        console.error("Error al crear observación:", err);
        return res.status(500).json({ error: "No se pudo guardar la observación" });
      }

      res.json({
        mensaje: "Observación guardada",
        id_observacion: result.insertId,
      });
    }
  );
};



// ---------------------------------------------------------------------
// 2) OBTENER OBSERVACIONES POR EXPEDIENTE (agrupadas por rol)
// ---------------------------------------------------------------------
export const obtenerObservaciones = (req, res) => {
  const { id_expediente } = req.params;

  const sql = `
    SELECT 
      o.*, 
      r.nombre AS rol
    FROM observaciones o
    JOIN usuario u ON o.id_usuario = u.id_usuario
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE o.id_expediente = ?
    ORDER BY o.fecha_hora DESC
  `;

  connection.query(sql, [id_expediente], (err, rows) => {
    if (err) {
      console.error("Error al obtener observaciones:", err);
      return res.status(500).json({ error: "Error al obtener observaciones" });
    }

    let respuesta = {
  Administrativo: [],
  Técnico: [],
  Jurídico: [],
  Director: []
};

rows.forEach(o => {
  if (o.rol === "Administrativo") respuesta.Administrativo.push(o);
  if (o.rol === "Técnico") respuesta.Técnico.push(o);
  if (o.rol === "Jurídico") respuesta.Jurídico.push(o);
  if (o.rol === "Director") respuesta.Director.push(o);
});


    res.json(respuesta);
  });
};
