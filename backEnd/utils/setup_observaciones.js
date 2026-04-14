import connection from "../configDB/dataBase.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS observaciones (
  id_observacion INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NOT NULL,
  id_usuario INT NOT NULL,
  id_rol INT DEFAULT NULL,
  observacion TEXT,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente', 'revisada', 'cerrada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (id_expediente),
  INDEX (id_usuario)
);
`;

console.log("Verificando tabla 'observaciones' con el esquema actual...");

connection.query(createTableSQL, (err, results) => {
  if (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
  console.log("✅ Tabla 'observaciones' lista.");
  process.exit(0);
});
