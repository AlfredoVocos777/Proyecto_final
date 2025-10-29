import connection from "../configDB/dataBase.js";

// Obtener todos los tramites de la base de datos
export const obtenerTramites = (req, res) => {
  connection.query("SELECT * FROM tramite", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los tramites" });
    }
    res.json(results);
  });
};

// Crear nuevo tramite de la pagina Nuevo_tramiteDatos
export const crearTramite = (req, res) => {
  const {
    tipo_tramite,
    denominacion,
    ubicacion,
    descripcion,
    id_usuario
  } = req.body;
  
  if (!id_usuario) {
    return res.status(400).json({ error: "Falta el id_usuario" });
  }

  const sql = `INSERT INTO tramite 
  (tipo_tramite, denominacion, ubicacion, descripcion,  id_usuario)
  VALUES (?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [tipo_tramite, denominacion, ubicacion, descripcion,  id_usuario],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al crear el tramite" });
      }
      res.status(200).json({ mensaje: "Tramite creado exitosamente", id: result.insertId });
    }
  );
};
