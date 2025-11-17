-- VERIFICACIÓN Y CORRECCIÓN RÁPIDA
USE sigedex;

-- Ver usuarios actuales
SELECT id_usuario, usuario, nombre, id_rol FROM usuario;

-- Si no hay usuarios o no tienen id_rol, crear usuario admin
DELETE FROM usuario WHERE usuario = 'admin';

INSERT INTO usuario (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña, id_rol)
SELECT 
    'Administrador',
    'Sistema',
    '12345678',
    'admin@dpa.gob.ar',
    'Dirección Provincial del Agua',
    '2614000000',
    'admin',
    'admin123',
    r.id_rol
FROM roles r
WHERE r.nombre = 'Administrativo'
LIMIT 1;

-- Verificar
SELECT 
    u.id_usuario,
    u.usuario,
    u.contraseña,
    u.nombre,
    u.id_rol,
    r.nombre as rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol
WHERE u.usuario = 'admin';
