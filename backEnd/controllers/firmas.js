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

