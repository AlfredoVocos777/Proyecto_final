import connection from "../configDB/dataBase.js";

export const listarPermisos = (req, res) => {
  connection.query("SELECT id_permiso, nombre, descripcion FROM permisos ORDER BY nombre ASC", (err, results) => {
    if (err) {
      console.error("Error al obtener permisos:", err);
      return res.status(500).json({ error: "Error al obtener permisos" });
    }
    res.json(results);
  });
};

export const obtenerPermisoPorId = (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM permisos WHERE id_permiso = ?", [id], (err, results) => {
    if (err) {
      console.error("Error al obtener permiso:", err);
      return res.status(500).json({ error: "Error al obtener permiso" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Permiso no encontrado" });
    }
    res.json(results[0]);
  });
};

export const crearPermiso = (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del permiso" });
  }
  connection.query(
    "INSERT INTO permisos (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear permiso:", err);
        return res.status(500).json({ error: "Error al crear permiso" });
      }
      res.status(201).json({ mensaje: "Permiso creado", id_permiso: result.insertId });
    }
  );
};

export const actualizarPermiso = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del permiso" });
  }
  
  connection.query(
    "UPDATE permisos SET nombre = ?, descripcion = ? WHERE id_permiso = ?",
    [nombre, descripcion || null, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar permiso:", err);
        return res.status(500).json({ error: "Error al actualizar permiso" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }
      
      res.json({ mensaje: "Permiso actualizado exitosamente" });
    }
  );
};

export const eliminarPermiso = (req, res) => {
  const { id } = req.params;
  
  // Primero eliminar las relaciones en rol_permisos
  connection.query("DELETE FROM rol_permisos WHERE id_permiso = ?", [id], (errRol) => {
    if (errRol) {
      console.error("Error al eliminar relaciones del permiso:", errRol);
      return res.status(500).json({ error: "Error al eliminar relaciones del permiso" });
    }
    
    // Luego eliminar el permiso
    connection.query("DELETE FROM permisos WHERE id_permiso = ?", [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar permiso:", err);
        return res.status(500).json({ error: "Error al eliminar permiso" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }
      
      res.json({ mensaje: "Permiso eliminado exitosamente" });
    });
  });
};

