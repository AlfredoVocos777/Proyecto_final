import connection from "../configDB/dataBase.js";

export const listarRoles = (req, res) => {
  // Primero obtener todos los roles
  connection.query("SELECT id_rol, nombre, descripcion FROM roles ORDER BY nombre ASC", (err, roles) => {
    if (err) {
      console.error("Error al obtener roles:", err);
      return res.status(500).json({ error: "Error al obtener roles" });
    }
    
    if (roles.length === 0) {
      return res.json([]);
    }
    
    // Para cada rol, obtener sus permisos
    const rolesConPermisos = [];
    let procesados = 0;
    
    roles.forEach((rol) => {
      connection.query(
        `SELECT p.id_permiso, p.nombre, p.descripcion 
         FROM permisos p
         INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
         WHERE rp.id_rol = ?`,
        [rol.id_rol],
        (errPermisos, permisos) => {
          if (errPermisos) {
            console.error("Error al obtener permisos:", errPermisos);
            rol.permisos = [];
          } else {
            rol.permisos = permisos;
          }
          
          rolesConPermisos.push(rol);
          procesados++;
          
          // Cuando se procesaron todos, enviar respuesta
          if (procesados === roles.length) {
            res.json(rolesConPermisos);
          }
        }
      );
    });
  });
};

export const obtenerRolPorId = (req, res) => {
  const { id } = req.params;
  
  // Obtener rol
  connection.query("SELECT * FROM roles WHERE id_rol = ?", [id], (err, results) => {
    if (err) {
      console.error("Error al obtener rol:", err);
      return res.status(500).json({ error: "Error al obtener rol" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    
    const rol = results[0];
    
    // Obtener permisos del rol
    connection.query(
      `SELECT p.id_permiso, p.nombre, p.descripcion 
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
       WHERE rp.id_rol = ?`,
      [id],
      (errPermisos, permisosResults) => {
        if (errPermisos) {
          console.error("Error al obtener permisos del rol:", errPermisos);
          return res.status(500).json({ error: "Error al obtener permisos del rol" });
        }
        
        rol.permisos = permisosResults;
        res.json(rol);
      }
    );
  });
};

export const crearRol = (req, res) => {
  const { nombre, descripcion, permisos = [] } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del rol" });
  }
  
  connection.query(
    "INSERT INTO roles (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear rol:", err);
        return res.status(500).json({ error: "Error al crear rol" });
      }
      
      const idRol = result.insertId;
      
      // Si hay permisos, asignarlos al rol
      if (permisos.length > 0) {
        const valores = permisos.map(idPermiso => [idRol, idPermiso]);
        connection.query(
          "INSERT INTO rol_permisos (id_rol, id_permiso) VALUES ?",
          [valores],
          (errPermiso) => {
            if (errPermiso) {
              console.error("Error al asignar permisos:", errPermiso);
              // No fallar por esto, el rol ya se creó
            }
          }
        );
      }
      
      res.status(201).json({
        mensaje: "Rol creado",
        id_rol: idRol,
      });
    }
  );
};

export const actualizarRol = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, permisos = [] } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: "Falta el nombre del rol" });
  }
  
  connection.query(
    "UPDATE roles SET nombre = ?, descripcion = ? WHERE id_rol = ?",
    [nombre, descripcion || null, id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar rol:", err);
        return res.status(500).json({ error: "Error al actualizar rol" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      
      // Actualizar permisos: primero eliminar los existentes
      connection.query(
        "DELETE FROM rol_permisos WHERE id_rol = ?",
        [id],
        (errDelete) => {
          if (errDelete) {
            console.error("Error al eliminar permisos:", errDelete);
          }
          
          // Luego insertar los nuevos
          if (permisos.length > 0) {
            const valores = permisos.map(idPermiso => [id, idPermiso]);
            connection.query(
              "INSERT INTO rol_permisos (id_rol, id_permiso) VALUES ?",
              [valores],
              (errInsert) => {
                if (errInsert) {
                  console.error("Error al asignar permisos:", errInsert);
                }
              }
            );
          }
        }
      );
      
      res.json({ mensaje: "Rol actualizado exitosamente" });
    }
  );
};

export const eliminarRol = (req, res) => {
  const { id } = req.params;
  
  // Primero eliminar las relaciones en rol_permisos
  connection.query("DELETE FROM rol_permisos WHERE id_rol = ?", [id], (errPermiso) => {
    if (errPermiso) {
      console.error("Error al eliminar permisos del rol:", errPermiso);
      return res.status(500).json({ error: "Error al eliminar permisos del rol" });
    }
    
    // Luego eliminar el rol
    connection.query("DELETE FROM roles WHERE id_rol = ?", [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar rol:", err);
        return res.status(500).json({ error: "Error al eliminar rol" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      
      res.json({ mensaje: "Rol eliminado exitosamente" });
    });
  });
};

