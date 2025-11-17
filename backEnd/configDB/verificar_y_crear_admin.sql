USE sigedex;

-- ========================================
-- VERIFICAR Y CREAR USUARIO ADMIN
-- ========================================

-- 1. Ver todos los usuarios actuales
SELECT 'USUARIOS ACTUALES:' as Info;
SELECT 
    id_usuario,
    usuario,
    nombre,
    contraseña,
    tipo_usuario,
    id_rol
FROM usuario;

-- 2. Ver roles disponibles
SELECT 'ROLES DISPONIBLES:' as Info;
SELECT id_rol, nombre FROM roles;

-- 3. Eliminar usuario admin si existe
DELETE FROM usuario WHERE usuario = 'admin';

-- 4. Crear usuario admin con tipo_usuario correcto
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
    (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Administrativo' LIMIT 1)
);

-- 5. Verificar usuario creado
SELECT 'USUARIO ADMIN CREADO:' as Info;
SELECT 
    u.id_usuario,
    u.usuario,
    u.contraseña,
    u.tipo_usuario,
    u.id_rol,
    r.nombre as nombre_rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol
WHERE u.usuario = 'admin';
