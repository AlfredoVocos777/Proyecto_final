// Obtener usuarios jurídicos para pase
export const obtenerUsuariosJuridicos = (req, res) => {
  // Puedes filtrar por departamento, expediente, etc. si lo necesitas
  const sql = `SELECT id_usuario, nombre, apellido, tipo_usuario FROM usuario WHERE tipo_usuario = 'jurídico'`;
  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener usuarios jurídicos" });
    }
    res.json(results);
  });
};
import connection from "../configDB/dataBase.js";
import bcrypt from "bcryptjs";

// Obtener todos los usuarios de la base de datos
export const obtenerUsuarios = (req, res) => {
  const sql = `
    SELECT u.*, r.nombre AS rol
    FROM usuario u
    LEFT JOIN roles r ON r.id_rol = u.id_rol
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
    res.json(results);
  });
};

// Crear nuevo usuario de la pagina Registro_usuario
export const crearUsuario = async (req, res) => {
  const {
    nombre,
    apellido,
    dni,
    email,
    direccion,
    telefono,
    usuario,
    contraseña,
  } = req.body;
  
  if (!nombre || !apellido || !dni || !email || !direccion || !telefono || !usuario || !contraseña ) {
        return res.status(400).json({
    error: 'Faltan datos requeridos para crear el usuario',
        });
    }

  try {
    // Hashear contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contraseña, salt);

    const sql = `INSERT INTO usuario 
    (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sql,
      [nombre, apellido, dni, email, direccion, telefono, usuario, hash],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error al crear el usuario" });
        }
        res.json({ mensaje: "Usuario creado exitosamente", id: result.insertId });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno creando usuario" });
  }
};

// Login usuario de la pagina Login_usuario
export const loginUsuario = (req, res) => {
  const { usuario, contraseña } = req.body;

  const sql = "SELECT * FROM usuario WHERE usuario = ?";
  connection.query(sql, [usuario], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al verificar usuario" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = results[0];
    const stored = user.contraseña || "";
    let ok = false;

    try {
      if (stored.startsWith("$2")) {
        // Comparar hash bcrypt
        ok = await bcrypt.compare(contraseña, stored);
      } else {
        // Soporte legado: contraseñas en texto plano
        ok = stored === contraseña;
        // Migración silenciosa a bcrypt si coincide
        if (ok) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(contraseña, salt);
          connection.query(
            "UPDATE usuario SET contraseña = ? WHERE id_usuario = ?",
            [hash, user.id_usuario],
            () => {}
          );
        }
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Error al validar credenciales" });
    }

    if (!ok) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // No devolvemos la contraseña al cliente
    const { contraseña: _omit, ...safeUser } = user;
    res.json({ mensaje: "Login exitoso", usuario: safeUser });
  });
};

// Eliminar usuario por id
export const eliminarUsuario = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID de usuario requerido" });
  const sql = "DELETE FROM usuario WHERE id_usuario = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "No se pudo eliminar el usuario (puede tener datos asociados)" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario eliminado" });
  });
};

// Obtener un usuario por id (con nombre de rol)
export const obtenerUsuarioPorId = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID requerido" });
  const sql = `SELECT u.*, r.nombre AS rol FROM usuario u LEFT JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`;
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener usuario" });
    if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    const user = results[0];
    // Ocultar contraseña
    delete user.contraseña;
    res.json(user);
  });
};

// Actualizar usuario (parcial). Si llega contraseña nueva, re-hash.
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  const camposPermitidos = [
    'nombre','apellido','dni','email','direccion','telefono','usuario','contraseña','tipo_usuario','id_rol','id_departamento'
  ];
  const datos = req.body || {};
  const setParts = [];
  const values = [];

  try {
    for (const key of camposPermitidos) {
      if (Object.prototype.hasOwnProperty.call(datos, key)) {
        if (key === 'contraseña') {
          if (datos[key]) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(datos[key], salt);
            setParts.push(`contraseña = ?`);
            values.push(hash);
          }
        } else {
          setParts.push(`${key} = ?`);
          values.push(datos[key]);
        }
      }
    }

    if (setParts.length === 0) {
      return res.status(400).json({ error: "Sin campos para actualizar" });
    }

    const sql = `UPDATE usuario SET ${setParts.join(', ')} WHERE id_usuario = ?`;
    values.push(id);
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al actualizar usuario" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ mensaje: "Usuario actualizado" });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno actualizando usuario" });
  }
};
