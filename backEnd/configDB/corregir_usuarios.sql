USE sigedex;

-- ========================================
-- SCRIPT DE CORRECCIÓN RÁPIDA
-- ========================================

-- OPCIÓN 1: Si la columna tipo_usuario todavía existe, hacer la migración
-- Ejecutar migrar_tipo_usuario_a_rol.sql primero

-- OPCIÓN 2: Si ya eliminaste tipo_usuario pero los usuarios no tienen id_rol
-- Asignar rol "Presentante" a usuarios sin rol (por defecto)
UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Presentante' LIMIT 1)
WHERE u.id_rol IS NULL;

-- OPCIÓN 3: Recrear el usuario admin si no existe o tiene problemas
-- Primero eliminar si existe
DELETE FROM usuario WHERE usuario = 'admin';

-- Crear nuevo usuario admin
INSERT INTO usuario (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña, id_rol)
VALUES (
    'Administrador',
    'Sistema',
    '12345678',
    'admin@dpa.gob.ar',
    'Dirección Provincial del Agua - Mendoza',
    '2614000000',
    'admin',
    'admin123',
    (SELECT id_rol FROM roles WHERE nombre = 'Administrativo' LIMIT 1)
);

-- VERIFICAR RESULTADO
SELECT 
    u.id_usuario,
    u.usuario,
    u.contraseña,
    u.nombre,
    u.apellido,
    r.nombre as rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol
WHERE u.usuario = 'admin';
