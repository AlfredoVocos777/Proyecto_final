USE sigedex;

CREATE TABLE IF NOT EXISTS tramite (
    id_tramite INT AUTO_INCREMENT PRIMARY KEY,
    tipo_tramite VARCHAR(100) NOT NULL,
    denominacion VARCHAR(255),
    ubicacion VARCHAR(255),
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

drop table tramite;

CREATE TABLE IF NOT EXISTS tramite (
    id_tramite INT AUTO_INCREMENT PRIMARY KEY,
    tipo_tramite VARCHAR(100) NOT NULL,
    denominacion VARCHAR(255),
    ubicacion VARCHAR(255),
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- 🔗 Claves foráneas
    id_usuario INT NOT NULL,
    id_expediente INT NOT NULL,
    id_documento INT NOT NULL,

    CONSTRAINT fk_tramite_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_tramite_expediente
        FOREIGN KEY (id_expediente)
        REFERENCES expedientes(id_expediente)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_tramite_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON UPDATE CASCADE ON DELETE CASCADE
);
 drop table tramite;
alter table expedientes
add column ubicacion varchar(255);






 