USE sigedex;

-- ========================================
-- RESTAURAR tipo_usuario EN USUARIOS
-- ========================================

-- 1. Si la columna tipo_usuario no existe, agregarla
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(20) NULL AFTER contraseña;

-- 2. Actualizar tipo_usuario basándose en id_rol
UPDATE usuario u
INNER JOIN roles r ON u.id_rol = r.id_rol
SET u.tipo_usuario = CASE 
    WHEN r.nombre = 'Administrativo' THEN 'administrativo'
    WHEN r.nombre = 'Director' THEN 'director'
    WHEN r.nombre = 'Técnico' THEN 'tecnico'
    WHEN r.nombre = 'Jurídico' THEN 'juridico'
    WHEN r.nombre = 'Presentante' THEN 'presentante'
    WHEN r.nombre = 'Admin TI' THEN 'admin_TI'
    ELSE 'comun'
END;

-- 3. Crear usuario admin si no existe con tipo_usuario
DELETE FROM usuario WHERE usuario = 'admin';

INSERT INTO usuario (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña, tipo_usuario, id_rol)
VALUES (
    'Administrador',
    'Sistema',
    '12345678',
    'admin@dpa.gob.ar',
    'Dirección Provincial del Agua - Mendoza',
    '2614000000',
    'admin',
    'admin123',
    'administrativo',
    (SELECT id_rol FROM roles WHERE nombre = 'Administrativo' LIMIT 1)
);

-- 4. Verificar resultado
SELECT 
    u.id_usuario,
    u.usuario,
    u.contraseña,
    u.tipo_usuario,
    r.nombre as rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol;
