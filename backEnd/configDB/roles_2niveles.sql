-- Migración a 2 niveles de roles para SIGEDEX
-- Objetivo: dejar solo 'Usuario comun' y 'Usuario avanzado', remapear usuarios y limpiar roles/permisos huérfanos
-- Uso: ejecutar en la base de datos 'sigedex'

USE sigedex;

START TRANSACTION;

-- Guardar y desactivar SQL_SAFE_UPDATES para evitar error 1175 en MySQL Workbench
SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- 1) Crear (si no existen) los dos roles objetivo
INSERT INTO roles (nombre, descripcion)
SELECT 'Usuario comun', 'Acceso básico: crear trámite y consultar expedientes'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Usuario comun');

INSERT INTO roles (nombre, descripcion)
SELECT 'Usuario avanzado', 'Acceso avanzado/administrativo al sistema'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Usuario avanzado');

-- 2) Guardar IDs
SET @id_comun = (SELECT id_rol FROM roles WHERE nombre = 'Usuario comun' LIMIT 1);
SET @id_avanzado = (SELECT id_rol FROM roles WHERE nombre = 'Usuario avanzado' LIMIT 1);

-- 2b) Asegurar que la columna tipo_usuario acepte los nuevos valores (evita 'Data truncated')
-- Si ya es VARCHAR, esta sentencia no hace daño; si era ENUM, la convierte adecuadamente.
ALTER TABLE usuario MODIFY COLUMN tipo_usuario VARCHAR(20) NOT NULL;

-- 3) Remapear usuarios a los nuevos roles según su tipo_usuario actual
--    Consideramos varios alias comunes para admins/avanzados
UPDATE usuario
   SET id_rol = @id_avanzado,
       tipo_usuario = 'avanzado'
 WHERE LOWER(COALESCE(tipo_usuario, '')) IN (
  'administrativo','admin','admin ti','director','tecnico','técnico','juridico','jurídico','avanzado'
 );

-- 3b) El resto pasan a común si no tienen ya asignado un id_rol
UPDATE usuario
   SET id_rol = @id_comun,
       tipo_usuario = 'comun'
 WHERE (id_rol IS NULL OR id_rol NOT IN (@id_comun, @id_avanzado));

-- 4) Limpiar relaciones de permisos de roles que no sean los nuevos
DELETE rp FROM rol_permisos rp
JOIN roles r ON rp.id_rol = r.id_rol
WHERE r.nombre NOT IN ('Usuario comun','Usuario avanzado');

-- 5) Borrar roles antiguos (mantener solo los dos nuevos)
DELETE FROM roles WHERE nombre NOT IN ('Usuario comun','Usuario avanzado');

-- 6) Reasignar permisos mínimos por rol (idempotente)
--    Comun: crear_tramite, ver_expedientes
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_comun, p.id_permiso
FROM permisos p
WHERE p.nombre IN ('crear_tramite','ver_expedientes')
  AND NOT EXISTS (
    SELECT 1 FROM rol_permisos rp WHERE rp.id_rol = @id_comun AND rp.id_permiso = p.id_permiso
  );

--    Avanzado: todos los permisos
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_avanzado, p.id_permiso
FROM permisos p
WHERE NOT EXISTS (
  SELECT 1 FROM rol_permisos rp WHERE rp.id_rol = @id_avanzado AND rp.id_permiso = p.id_permiso
);

COMMIT;

-- Restaurar configuración de SQL_SAFE_UPDATES
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- Verificación
SELECT 'ROLES' AS tabla; SELECT * FROM roles ORDER BY id_rol;
SELECT 'USUARIOS REMAPEADOS' AS info;
SELECT u.id_usuario, u.usuario, u.tipo_usuario, r.nombre AS rol
FROM usuario u
LEFT JOIN roles r ON r.id_rol = u.id_rol
ORDER BY u.id_usuario;

SELECT 'PERMISOS POR ROL' AS info;
SELECT r.nombre AS rol, p.nombre AS permiso
FROM rol_permisos rp
JOIN roles r ON r.id_rol = rp.id_rol
JOIN permisos p ON p.id_permiso = rp.id_permiso
ORDER BY r.nombre, p.nombre;
