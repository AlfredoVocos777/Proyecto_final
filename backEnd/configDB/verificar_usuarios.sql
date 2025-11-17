USE sigedex;

-- ========================================
-- SCRIPT DE VERIFICACIÓN Y CORRECCIÓN
-- ========================================

-- 1. Ver estructura de la tabla usuario
SELECT 'ESTRUCTURA DE LA TABLA USUARIO:' as Info;
DESCRIBE usuario;

-- 2. Ver usuarios existentes
SELECT 'USUARIOS EXISTENTES:' as Info;
SELECT 
    id_usuario,
    usuario,
    nombre,
    apellido,
    email,
    id_rol,
    CASE 
        WHEN contraseña LIKE '$2%' THEN 'Hasheada con bcrypt'
        ELSE 'Texto plano'
    END as tipo_contraseña
FROM usuario;

-- 3. Ver roles disponibles
SELECT 'ROLES DISPONIBLES:' as Info;
SELECT id_rol, nombre, descripcion FROM roles;

-- 4. Verificar si hay usuarios sin rol asignado
SELECT 'USUARIOS SIN ROL:' as Info;
SELECT COUNT(*) as cantidad FROM usuario WHERE id_rol IS NULL;

-- 5. Ver usuarios con sus roles
SELECT 'USUARIOS CON ROLES:' as Info;
SELECT 
    u.id_usuario,
    u.usuario,
    u.nombre,
    u.apellido,
    u.id_rol,
    r.nombre as rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol;
