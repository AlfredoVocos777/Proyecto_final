USE sigedex;

-- ========================================
-- AGREGAR COLUMNA tipo_usuario A LA TABLA usuario
-- ========================================

-- 1. Ver estructura actual
DESCRIBE usuario;

-- 2. Agregar columna tipo_usuario después de contraseña
ALTER TABLE usuario 
ADD COLUMN tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'presentante' 
AFTER contraseña;

-- 3. Actualizar tipo_usuario según el rol actual
UPDATE usuario u
INNER JOIN roles r ON u.id_rol = r.id_rol
SET u.tipo_usuario = CASE 
    WHEN r.nombre = 'Administrativo' THEN 'administrativo'
    WHEN r.nombre = 'Director' THEN 'director'
    WHEN r.nombre = 'Técnico' THEN 'tecnico'
    WHEN r.nombre = 'Jurídico' THEN 'juridico'
    WHEN r.nombre = 'Presentante' THEN 'presentante'
    WHEN r.nombre = 'Admin TI' THEN 'admin_TI'
    ELSE 'presentante'
END
WHERE u.id_rol IS NOT NULL;

-- 4. Actualizar usuarios sin rol a 'presentante'
UPDATE usuario 
SET tipo_usuario = 'presentante' 
WHERE id_rol IS NULL;

-- 5. Verificar que todos los usuarios tengan tipo_usuario
SELECT 
    id_usuario,
    usuario,
    tipo_usuario,
    id_rol,
    (SELECT nombre FROM roles WHERE id_rol = usuario.id_rol) as rol
FROM usuario;

-- 6. Ver estructura final
DESCRIBE usuario;
