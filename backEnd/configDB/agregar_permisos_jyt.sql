-- Script para agregar permisos JyT y asignarlos a roles Técnico y Jurídico
-- Ejecutar en la base de datos sigedex

USE sigedex;

-- ========================================
-- 0. CREAR ROLES TÉCNICO Y JURÍDICO SI NO EXISTEN
-- ========================================

INSERT INTO roles (nombre, descripcion)
SELECT 'Técnico', 'Personal técnico - puede gestionar expedientes y realizar análisis técnicos'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Técnico');

INSERT INTO roles (nombre, descripcion)
SELECT 'Jurídico', 'Personal legal - puede revisar aspectos legales de expedientes'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Jurídico');

-- ========================================
-- 1. AGREGAR NUEVOS PERMISOS JYT
-- ========================================

-- Inserción idempotente: solo inserta si no existe un permiso con ese nombre
INSERT INTO permisos (nombre, descripcion)
SELECT 'realizar_pase', 'Permite realizar pases de expedientes entre áreas/departamentos'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'realizar_pase');

INSERT INTO permisos (nombre, descripcion)
SELECT 'deshacer_pase', 'Permite deshacer pases de expedientes realizados previamente'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'deshacer_pase');

INSERT INTO permisos (nombre, descripcion)
SELECT 'consultar_expediente_detalle', 'Permite consultar el detalle completo de un expediente'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'consultar_expediente_detalle');

INSERT INTO permisos (nombre, descripcion)
SELECT 'recepcion_pase', 'Permite recepcionar expedientes y realizar pases'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'recepcion_pase');

INSERT INTO permisos (nombre, descripcion)
SELECT 'rechazar_recepcion', 'Permite rechazar la recepción de expedientes'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'rechazar_recepcion');

INSERT INTO permisos (nombre, descripcion)
SELECT 'ver_manual_usuario', 'Permite acceder al manual de usuario del sistema'
WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE nombre = 'ver_manual_usuario');

-- ========================================
-- 2. ASIGNAR PERMISOS A ROLES TÉCNICO Y JURÍDICO
-- ========================================

-- Obtener IDs de roles
SET @id_tecnico = (SELECT id_rol FROM roles WHERE nombre = 'Técnico' LIMIT 1);
SET @id_juridico = (SELECT id_rol FROM roles WHERE nombre = 'Jurídico' LIMIT 1);

-- Asignar todos los permisos JyT a Técnico
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_tecnico, id_permiso
FROM permisos
WHERE nombre IN (
  'realizar_pase',
  'deshacer_pase',
  'consultar_expediente_detalle',
  'recepcion_pase',
  'rechazar_recepcion',
  'ver_manual_usuario'
)
AND NOT EXISTS (
  SELECT 1 FROM rol_permisos rp 
  WHERE rp.id_rol = @id_tecnico AND rp.id_permiso = permisos.id_permiso
);

-- Asignar todos los permisos JyT a Jurídico
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_juridico, id_permiso
FROM permisos
WHERE nombre IN (
  'realizar_pase',
  'deshacer_pase',
  'consultar_expediente_detalle',
  'recepcion_pase',
  'rechazar_recepcion',
  'ver_manual_usuario'
)
AND NOT EXISTS (
  SELECT 1 FROM rol_permisos rp 
  WHERE rp.id_rol = @id_juridico AND rp.id_permiso = permisos.id_permiso
);

-- ========================================
-- 3. VERIFICACIÓN
-- ========================================

SELECT 'NUEVOS PERMISOS JyT:' as Info;
SELECT * FROM permisos 
WHERE nombre IN (
  'realizar_pase',
  'deshacer_pase',
  'consultar_expediente_detalle',
  'recepcion_pase',
  'rechazar_recepcion',
  'ver_manual_usuario'
)
ORDER BY id_permiso;

SELECT 'PERMISOS ASIGNADOS A TÉCNICO:' as Info;
SELECT r.nombre as Rol, p.nombre as Permiso, p.descripcion
FROM rol_permisos rp
JOIN roles r ON rp.id_rol = r.id_rol
JOIN permisos p ON rp.id_permiso = p.id_permiso
WHERE r.nombre = 'Técnico'
ORDER BY p.nombre;

SELECT 'PERMISOS ASIGNADOS A JURÍDICO:' as Info;
SELECT r.nombre as Rol, p.nombre as Permiso, p.descripcion
FROM rol_permisos rp
JOIN roles r ON rp.id_rol = r.id_rol
JOIN permisos p ON rp.id_permiso = p.id_permiso
WHERE r.nombre = 'Jurídico'
ORDER BY p.nombre;
