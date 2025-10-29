-- ===========================================
--   SCRIPT BASE DE DATOS SIGEDEX (MySQL)
-- ===========================================

CREATE DATABASE IF NOT EXISTS sigedex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sigedex;

-- ===========================================
--   1. TABLA: Departamentos
-- ===========================================
CREATE TABLE Departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ===========================================
--   2. TABLA: Roles
-- ===========================================
CREATE TABLE Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ===========================================
--   3. TABLA: Permisos
-- ===========================================
CREATE TABLE Permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ===========================================
--   4. TABLA INTERMEDIA: Rol_Permisos
-- ===========================================
CREATE TABLE Rol_Permisos (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES Permisos(id_permiso) ON DELETE CASCADE
);

-- ===========================================
--   5. TABLA: Usuarios
-- ===========================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni_cuit VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    tipo_usuario ENUM('presentante','administrativo','técnico','jurídico','director','admin_TI') NOT NULL,
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    id_departamento INT,
    id_rol INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

-- ===========================================
--   6. TABLA: Expedientes
-- ===========================================
CREATE TABLE Expedientes (
    id_expediente INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(50) UNIQUE NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    estado_actual ENUM('en revisión','aprobado','rechazado','archivado') DEFAULT 'en revisión',
    id_usuario_presentante INT NOT NULL,
    id_profesional_asignado INT,
    tipo_expediente VARCHAR(50),
    descripcion LONGTEXT,
    fecha_cierre DATETIME NULL,
    prioridad ENUM('alta','media','baja') DEFAULT 'media',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_presentante) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_profesional_asignado) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   7. TABLA: Documentos
-- ===========================================
CREATE TABLE Documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_expediente INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    ruta_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME NOT NULL,
    subido_por INT NOT NULL,
    tamaño_archivo BIGINT,
    hash_integridad VARCHAR(255),
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   8. TABLA: Historial_Expediente
-- ===========================================
CREATE TABLE Historial_Expediente (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_expediente INT NOT NULL,
    fecha DATETIME NOT NULL,
    accion VARCHAR(255),
    comentario TEXT,
    id_usuario_responsable INT,
    id_departamento INT,
    tipo_accion ENUM('asignación','revisión','firma','observación','cierre'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_responsable) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
);

-- ===========================================
--   9. TABLA: Consultas_En_Tiempo_Real
-- ===========================================
CREATE TABLE Consultas_En_Tiempo_Real (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_expediente INT,
    id_usuario_emisor INT,
    id_usuario_receptor INT,
    mensaje TEXT,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','respondida','cerrada') DEFAULT 'pendiente',
    canal_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_emisor) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_usuario_receptor) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   10. TABLA: Notificaciones
-- ===========================================
CREATE TABLE Notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    mensaje TEXT,
    tipo VARCHAR(50),
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT FALSE,
    canal ENUM('sistema','email','push') DEFAULT 'sistema',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   11. TABLA: Firmas_Digitales
-- ===========================================
CREATE TABLE Firmas_Digitales (
    id_firma INT AUTO_INCREMENT PRIMARY KEY,
    id_expediente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_firma DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash_documento VARCHAR(255),
    metodo_firma VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   12. TABLA: Auditoría_Sistema
-- ===========================================
CREATE TABLE Auditoria_Sistema (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(255),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50),
    nivel ENUM('info','warning','error') DEFAULT 'info',
    user_agent VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   13. TABLA: Logs
-- ===========================================
CREATE TABLE Logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_expediente INT NULL,
    accion VARCHAR(255),
    descripcion TEXT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    nivel ENUM('info','warning','error') DEFAULT 'info',
    user_agent VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente)
);

-- ===========================================
--   14. TABLA: Observaciones
-- ===========================================
CREATE TABLE Observaciones (
    id_observacion INT AUTO_INCREMENT PRIMARY KEY,
    id_expediente INT NOT NULL,
    id_usuario INT NOT NULL,
    observacion TEXT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','revisada','cerrada') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- ===========================================
--   15. TABLA: Pagos
-- ===========================================
CREATE TABLE Pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_expediente INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('tarjeta','transferencia','otros') DEFAULT 'tarjeta',
    estado_pago ENUM('pendiente','confirmado','fallido') DEFAULT 'pendiente',
    referencia_pasarela VARCHAR(255) COMMENT 'ID de confirmación devuelto por la pasarela',
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_expediente) REFERENCES Expedientes(id_expediente)
);

-- ===========================================
-- FIN DEL SCRIPT
-- ===========================================
SHOW TABLES;
DESCRIBE usuario;
RENAME TABLE Usuarios TO usuario;
ALTER TABLE Usuarios
DROP COLUMN tipo_usuario,
DROP COLUMN estado,
DROP COLUMN fecha_creacion,
DROP COLUMN ultimo_acceso;
ALTER TABLE usuario
DROP COLUMN tipo_usuario,
DROP COLUMN estado,
DROP COLUMN fecha_creacion,
DROP COLUMN ultimo_acceso;

ALTER TABLE usuario
CHANGE COLUMN dni_cuit dni VARCHAR(20) UNIQUE NOT NULL;
ALTER TABLE usuario DROP INDEX dni_cuit;
ALTER TABLE usuario ADD UNIQUE (dni);
SHOW INDEXES FROM usuario;
ALTER TABLE usuario DROP INDEX dni_2;
ALTER TABLE usuario DROP INDEX dni_3;
SHOW INDEXES FROM usuario;
SHOW INDEX FROM usuario;
ALTER TABLE usuario CHANGE dni_cuit dni VARCHAR(20) UNIQUE NOT NULL;
SHOW COLUMNS FROM usuario;
ALTER TABLE usuario CHANGE password_hash contraseña VARCHAR(255) NOT NULL;
ALTER TABLE usuario ADD COLUMN usuario VARCHAR(100) NOT NULL;
ALTER TABLE usuario ADD COLUMN direccion VARCHAR(100) NOT NULL;

ALTER TABLE usuario 
ADD COLUMN tipo_tramite VARCHAR(100),
ADD COLUMN denominacion VARCHAR(255),
ADD COLUMN ubicacion VARCHAR(255),
ADD COLUMN descripcion TEXT;
