import connection from "../configDB/dataBase.js";

// Obtener todos los expedientes de la base de datos
export const obtenerExpediente = (req, res) => {
  connection.query("SELECT * FROM expedientes", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los expedientes" });
    }
    res.json(results);
  });
};

// Crear nuevo expediente de la pagina Nuevo_expedienteDatos
export const crearExpediente = (req, res) => {
  const {
    tipo_expediente,
    denominacion,
    ubicacion,
    descripcion,
    id_usuario
  } = req.body;
  
  if (!id_usuario) {
    return res.status(400).json({ error: "Falta el id_usuario" });
  }

  const sql = `INSERT INTO expedientes 
  (tipo_expediente, denominacion, ubicacion, descripcion, id_usuario)
  VALUES (?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [tipo_expediente, denominacion, ubicacion, descripcion, id_usuario],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al crear el expediente" });
      }
      res.status(200).json({ mensaje: "Expediente creado exitosamente", id: result.insertId });
    }
  );
};
