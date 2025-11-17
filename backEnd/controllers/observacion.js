// observaciones.js
import connection from "../configDB/dataBase.js";

// Crear una observación
export const crearObservacion = (req, res) => {
  const { id_expediente, id_usuario, rol, observacion } = req.body;

  if (!id_expediente || !id_usuario || !rol || !observacion?.trim()) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const sql = `
    INSERT INTO observaciones 
      (id_expediente, id_usuario, rol, observacion, fecha_hora, estado, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), 'pendiente', NOW(), NOW())
  `;

  connection.query(sql, [id_expediente, id_usuario, rol, observacion], (err, result) => {
    if (err) {
      console.error("Error al crear observación:", err);
      return res.status(500).json({ error: "No se pudo guardar la observación" });
    }

    res.json({ mensaje: "Observación guardada", id_observacion: result.insertId });
  });
};

// GET que organiza por rol
//obtener una observacion
export const obtenerObservaciones = (req, res) => {
  const { id_expediente } = req.params;

  const sql = `
    SELECT * FROM observaciones
    WHERE id_expediente = ?
    ORDER BY fecha_hora DESC
  `;

  connection.query(sql, [id_expediente], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener observaciones" });

    let respuesta = {
      admin: null,
      tecnico: null,
      juridico: null,
      director: null
    };

    rows.forEach(o => {
      if (o.rol === "admin") respuesta.admin = o;
      if (o.rol === "tecnico") respuesta.tecnico = o;
      if (o.rol === "juridico") respuesta.juridico = o;
      if (o.rol === "director") respuesta.director = o;
    });

    res.json(respuesta);
  });
};
