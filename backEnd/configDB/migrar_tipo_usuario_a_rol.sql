USE sigedex;

-- ========================================
-- MIGRACIÓN: Eliminar tipo_usuario y usar solo id_rol
-- ========================================

-- 1. Asegurar que todos los usuarios tengan un id_rol asignado según su tipo_usuario
UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Administrativo' LIMIT 1)
WHERE (u.tipo_usuario = 'administrativo' OR u.tipo_usuario = 'avanzado') AND u.id_rol IS NULL;

UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Director' LIMIT 1)
WHERE u.tipo_usuario = 'director' AND u.id_rol IS NULL;

UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Técnico' LIMIT 1)
WHERE u.tipo_usuario = 'tecnico' AND u.id_rol IS NULL;

UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Jurídico' LIMIT 1)
WHERE u.tipo_usuario = 'juridico' AND u.id_rol IS NULL;

UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Presentante' LIMIT 1)
WHERE u.tipo_usuario = 'presentante' AND u.id_rol IS NULL;

-- 2. Hacer id_rol NOT NULL (ahora todos los usuarios tienen rol asignado)
ALTER TABLE usuario MODIFY COLUMN id_rol INT NOT NULL;

-- 3. Eliminar la columna tipo_usuario (ya no es necesaria)
ALTER TABLE usuario DROP COLUMN tipo_usuario;

-- 4. Verificar la migración
SELECT 
    u.id_usuario,
    u.usuario,
    u.nombre,
    u.apellido,
    r.nombre AS rol
FROM usuario u
INNER JOIN roles r ON r.id_rol = u.id_rol
ORDER BY r.nombre, u.usuario;
