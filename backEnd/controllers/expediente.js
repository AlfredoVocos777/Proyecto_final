import connection from "../configDB/dataBase.js";

// Obtener todos los expedientes (solo por si querés listar)
export const obtenerExpediente = (req, res) => {
  connection.query("SELECT * FROM expedientes", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener expedientes:", err);
      return res.status(500).json({ error: "Error al obtener los expedientes" });
    }
    res.json(results);
  });
};

// Crear nuevo expediente automáticamente
export const crearExpediente = (req, res) => {
  const { id_usuario, id_tramite } = req.body;

  // Validación básica
  if (!id_usuario || !id_tramite) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const year = new Date().getFullYear();

  // Buscar el último número de expediente del año actual
  const sqlUltimo = `
    SELECT numero_expediente 
    FROM expedientes 
    WHERE numero_expediente LIKE '${year}/%'
    ORDER BY id_expediente DESC 
    LIMIT 1
  `;

  connection.query(sqlUltimo, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener el último expediente:", err);
      return res.status(500).json({ error: "Error al generar número de expediente" });
    }

    let nuevoNumero = 1;
    if (results.length > 0) {
      const ultimoNumero = results[0].numero_expediente.split("/")[1];
      nuevoNumero = parseInt(ultimoNumero) + 1;
    }

    const numeroFormateado = nuevoNumero.toString().padStart(4, "0");
    const numero_expediente = `${year}/${numeroFormateado}`;
    const fecha_creacion = new Date();

    // Insertar el nuevo expediente
    const sqlInsert = `
      INSERT INTO expedientes (numero_expediente, fecha_creacion, id_usuario, id_tramite)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(
      sqlInsert,
      [numero_expediente, fecha_creacion, id_usuario, id_tramite],
      (err, result) => {
        if (err) {
          console.error("❌ Error al crear expediente:", err);
          return res.status(500).json({ error: "Error al crear expediente" });
        }

        // Devolver los datos al frontend
        res.status(200).json({
          mensaje: "Expediente creado exitosamente",
          id_expediente: result.insertId,
          numero_expediente,
          fecha_creacion,
        });
      }
    );
  });
};
