import connection from "../configDB/dataBase.js";

// Inicializar tabla si no existe
const initTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS tipos_tramite (
      id_tipo INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      importe DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  connection.query(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla tipos_tramite:", err);
      return;
    }
    // Insertar registros por defecto si la tabla está vacía
    const checkSql = "SELECT COUNT(*) AS total FROM tipos_tramite";
    connection.query(checkSql, (err2, results) => {
      if (err2 || !results) return;
      if (results[0].total === 0) {
        const insertSql = `
          INSERT INTO tipos_tramite (nombre, importe) VALUES
          ('Constancia de prefactibilidad de no inundabilidad', 0.05),
          ('Línea de ribera', 0.05),
          ('Obra nueva', 0.05)
        `;
        connection.query(insertSql, (err3) => {
          if (err3) console.error("Error al insertar tipos por defecto:", err3);
        });
      }
    });
  });
};

initTable();

// GET /tipos-tramite — obtener todos
export const obtenerTiposTramite = (req, res) => {
  connection.query(
    "SELECT * FROM tipos_tramite ORDER BY nombre ASC",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener tipos de trámite" });
      }
      res.json(results);
    }
  );
};

// POST /tipos-tramite — crear
export const crearTipoTramite = (req, res) => {
  const { nombre, importe } = req.body;
  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (importe === undefined || importe === null || isNaN(Number(importe))) {
    return res.status(400).json({ error: "El importe debe ser un número válido" });
  }
  const sql = "INSERT INTO tipos_tramite (nombre, importe) VALUES (?, ?)";
  connection.query(sql, [nombre.trim(), Number(importe)], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al crear el tipo de trámite" });
    }
    res.status(201).json({ mensaje: "Tipo de trámite creado", id: result.insertId });
  });
};

// PUT /tipos-tramite/:id — actualizar
export const actualizarTipoTramite = (req, res) => {
  const { id } = req.params;
  const { nombre, importe } = req.body;
  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (importe === undefined || importe === null || isNaN(Number(importe))) {
    return res.status(400).json({ error: "El importe debe ser un número válido" });
  }
  const sql = "UPDATE tipos_tramite SET nombre = ?, importe = ? WHERE id_tipo = ?";
  connection.query(sql, [nombre.trim(), Number(importe), id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al actualizar el tipo de trámite" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de trámite no encontrado" });
    }
    res.json({ mensaje: "Tipo de trámite actualizado" });
  });
};

// DELETE /tipos-tramite/:id — eliminar
export const eliminarTipoTramite = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM tipos_tramite WHERE id_tipo = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al eliminar el tipo de trámite" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de trámite no encontrado" });
    }
    res.json({ mensaje: "Tipo de trámite eliminado" });
  });
};
