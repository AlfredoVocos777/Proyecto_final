USE sigedex;

-- ========================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA
-- ========================================

-- 1. Verificar estructura de tabla usuario
SHOW COLUMNS FROM usuario;

-- 2. Contar usuarios totales
SELECT 'TOTAL DE USUARIOS' as Metrica, COUNT(*) as Cantidad FROM usuario;

-- 3. Usuarios con y sin rol
SELECT 
    'Usuarios CON rol asignado' as Estado,
    COUNT(*) as Cantidad
FROM usuario 
WHERE id_rol IS NOT NULL
UNION ALL
SELECT 
    'Usuarios SIN rol asignado' as Estado,
    COUNT(*) as Cantidad
FROM usuario 
WHERE id_rol IS NULL;

-- 4. Lista de todos los usuarios con detalles
SELECT 
    u.id_usuario,
    u.usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.id_rol,
    r.nombre as nombre_rol,
    CASE 
        WHEN u.contraseña LIKE '$2a$%' OR u.contraseña LIKE '$2b$%' THEN 'Hasheada (bcrypt)'
        ELSE CONCAT('Texto plano: "', LEFT(u.contraseña, 20), '"')
    END as tipo_password
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol
ORDER BY u.id_usuario;

-- 5. Roles disponibles
SELECT 
    id_rol,
    nombre,
    descripcion
FROM roles
ORDER BY id_rol;

-- 6. Permisos por rol
SELECT 
    r.nombre as Rol,
    COUNT(rp.id_permiso) as Total_Permisos
FROM roles r
LEFT JOIN rol_permisos rp ON r.id_rol = rp.id_rol
GROUP BY r.id_rol, r.nombre
ORDER BY r.nombre;
