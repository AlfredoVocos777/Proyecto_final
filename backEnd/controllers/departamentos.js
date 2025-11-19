import connection from "../configDB/dataBase.js";

export const listarDepartamentos = (req, res) => {
  // Primero obtener todos los departamentos
  connection.query("SELECT id_departamento, nombre, descripcion FROM departamentos ORDER BY nombre ASC", (err, departamentos) => {
    if (err) {
      console.error("Error al obtener departamentos:", err);
      return res.status(500).json({ error: "Error al obtener departamentos" });
    }
    
    if (departamentos.length === 0) {
      return res.json([]);
    }
    
    // Para cada departamento, obtener sus usuarios
    const departamentosConUsuarios = [];
    let procesados = 0;
    
    departamentos.forEach((dept) => {
      connection.query(
        `SELECT id_usuario, nombre, apellido, usuario, email 
         FROM usuario 
         WHERE id_departamento = ?`,
        [dept.id_departamento],
        (errUsuarios, usuarios) => {
          if (errUsuarios) {
            console.error("Error al obtener usuarios:", errUsuarios);
            dept.usuarios = [];
          } else {
            dept.usuarios = usuarios;
          }
          
          departamentosConUsuarios.push(dept);
          procesados++;
          
          // Cuando se procesaron todos, enviar respuesta
          if (procesados === departamentos.length) {
            res.json(departamentosConUsuarios);
          }
        }
      );
    });
  });
};

export const obtenerDepartamentoPorId = (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM departamentos WHERE id_departamento = ?", [id], (err, results) => {
    if (err) {
      console.error("Error al obtener departamento:", err);
      return res.status(500).json({ error: "Error al obtener departamento" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    res.json(results[0]);
  });
};

export const crearDepartamento = (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del departamento" });
  }
  connection.query(
    "INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear departamento:", err);
        return res.status(500).json({ error: "Error al crear departamento" });
      }
      res.status(201).json({ mensaje: "Departamento creado", id_departamento: result.insertId });
    }
  );
};

export const actualizarDepartamento = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del departamento" });
  }
  
  connection.query(
    "UPDATE departamentos SET nombre = ?, descripcion = ? WHERE id_departamento = ?",
    [nombre, descripcion || null, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar departamento:", err);
        return res.status(500).json({ error: "Error al actualizar departamento" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
      
      res.json({ mensaje: "Departamento actualizado exitosamente" });
    }
  );
};

export const eliminarDepartamento = (req, res) => {
  const { id } = req.params;
  
  connection.query("DELETE FROM departamentos WHERE id_departamento = ?", [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar departamento:", err);
      return res.status(500).json({ error: "Error al eliminar departamento" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    
    res.json({ mensaje: "Departamento eliminado exitosamente" });
  });
};

