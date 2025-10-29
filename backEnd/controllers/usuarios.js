import connection from "../configDB/dataBase.js";

// Obtener todos los usuarios de la base de datos
export const obtenerUsuarios = (req, res) => {
  connection.query("SELECT * FROM usuario", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
    res.json(results);
  });
};

// Crear nuevo usuario de la pagina Registro_usuario
export const crearUsuario = (req, res) => {
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
  
  if (!nombre || !apellido || !dni || !email || !direccion || !telefono || !usuario || !contraseña) {
        return res.status(400).json({
        error: 'Faltan datos requeridos para crear el usuario',
        });
    }

  const sql = `INSERT INTO usuario 
  (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [nombre, apellido, dni, email, direccion, telefono, usuario, contraseña],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al crear el usuario" });
      }
      res.json({ mensaje: "Usuario creado exitosamente", id: result.insertId });
    }
  );
};

// Login usuario de la pagina Login_usuario
export const loginUsuario = (req, res) => {
  const { usuario, contraseña } = req.body;

  const sql = "SELECT * FROM usuario WHERE usuario = ? AND contraseña = ?";
  connection.query(sql, [usuario, contraseña], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al verificar usuario" });
    }

    if (results.length > 0) {
      res.json({ mensaje: "Login exitoso", usuario: results[0] });
    } else {
      res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
  });
};
