-- Script de Inicialización de Roles y Permisos para SIGEDEX
-- Base de datos: sigedex
-- IMPORTANTE: Ejecutar este script después de crear las tablas

USE sigedex;

-- ========================================
-- 0. LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- ========================================
-- Descomentar estas líneas si quieres empezar desde cero
/*
DELETE FROM rol_permisos;
DELETE FROM usuario;
DELETE FROM departamentos;
DELETE FROM roles;
DELETE FROM permisos;
*/

-- ========================================
-- 1. CREAR PERMISOS BÁSICOS
-- ========================================

INSERT INTO permisos (nombre, descripcion) VALUES
('crear_usuario', 'Permite crear nuevos usuarios en el sistema'),
('editar_usuario', 'Permite modificar datos de usuarios existentes'),
('eliminar_usuario', 'Permite eliminar usuarios del sistema'),
('ver_usuarios', 'Permite ver el listado de usuarios'),
('crear_expediente', 'Permite crear nuevos expedientes'),
('editar_expediente', 'Permite modificar expedientes existentes'),
('archivar_expediente', 'Permite archivar expedientes'),
('ver_expedientes', 'Permite ver expedientes'),
('crear_tramite', 'Permite crear nuevos trámites'),
('gestionar_pagos', 'Permite gestionar pagos de trámites'),
('firmar_digitalmente', 'Permite realizar firmas digitales'),
('gestionar_roles', 'Permite crear y modificar roles'),
('gestionar_permisos', 'Permite crear y modificar permisos'),
('gestionar_departamentos', 'Permite crear y modificar departamentos'),
('ver_reportes', 'Permite visualizar reportes del sistema'),
('configurar_sistema', 'Permite modificar configuraciones del sistema'),
('realizar_pase', 'Permite realizar pases de expedientes entre áreas/departamentos'),
('deshacer_pase', 'Permite deshacer pases de expedientes realizados previamente'),
('consultar_expediente_detalle', 'Permite consultar el detalle completo de un expediente'),
('recepcion_pase', 'Permite recepcionar expedientes y realizar pases'),
('rechazar_recepcion', 'Permite rechazar la recepción de expedientes'),
('ver_manual_usuario', 'Permite acceder al manual de usuario del sistema');

-- ========================================
-- 2. CREAR ROLES
-- ========================================

-- Inserción idempotente: solo inserta si no existe un rol con ese nombre
INSERT INTO roles (nombre, descripcion)
SELECT 'Administrativo', 'Acceso completo al sistema - puede gestionar usuarios, roles, permisos y todas las funciones administrativas'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Administrativo');

INSERT INTO roles (nombre, descripcion)
SELECT 'Director', 'Acceso de dirección - puede ver reportes y aprobar expedientes importantes'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Director');

INSERT INTO roles (nombre, descripcion)
SELECT 'Técnico', 'Personal técnico - puede gestionar expedientes y realizar análisis técnicos'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Técnico');

INSERT INTO roles (nombre, descripcion)
SELECT 'Jurídico', 'Personal legal - puede revisar aspectos legales de expedientes'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Jurídico');

INSERT INTO roles (nombre, descripcion)
SELECT 'Presentante', 'Usuario básico - puede crear trámites y consultar sus expedientes'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Presentante');

-- ========================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ========================================

-- Variables para almacenar los IDs de roles
SET @id_admin = (SELECT id_rol FROM roles WHERE nombre = 'Administrativo' LIMIT 1);
SET @id_director = (SELECT id_rol FROM roles WHERE nombre = 'Director' LIMIT 1);
SET @id_tecnico = (SELECT id_rol FROM roles WHERE nombre = 'Técnico' LIMIT 1);
SET @id_juridico = (SELECT id_rol FROM roles WHERE nombre = 'Jurídico' LIMIT 1);
SET @id_presentante = (SELECT id_rol FROM roles WHERE nombre = 'Presentante' LIMIT 1);

-- ROL: Administrativo (TODOS los permisos)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_admin, id_permiso FROM permisos;

-- ROL: Director (Permisos de visualización y aprobación)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_director, id_permiso
FROM permisos
WHERE nombre IN ('ver_usuarios', 'ver_expedientes', 'ver_reportes', 'archivar_expediente', 'firmar_digitalmente');

-- ROL: Técnico (Gestión de expedientes y trámites + Permisos JyT)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_tecnico, id_permiso
FROM permisos
WHERE nombre IN ('crear_expediente', 'editar_expediente', 'ver_expedientes', 'crear_tramite', 'firmar_digitalmente', 
                 'realizar_pase', 'deshacer_pase', 'consultar_expediente_detalle', 'recepcion_pase', 'rechazar_recepcion', 'ver_manual_usuario');

-- ROL: Jurídico (Revisión legal y firma + Permisos JyT)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_juridico, id_permiso
FROM permisos
WHERE nombre IN ('ver_expedientes', 'editar_expediente', 'firmar_digitalmente', 'ver_reportes',
                 'realizar_pase', 'deshacer_pase', 'consultar_expediente_detalle', 'recepcion_pase', 'rechazar_recepcion', 'ver_manual_usuario');

-- ROL: Presentante (Crear trámites y consultar)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT @id_presentante, id_permiso
FROM permisos
WHERE nombre IN ('crear_tramite', 'ver_expedientes');

-- ========================================
-- 4. CREAR DEPARTAMENTOS
-- ========================================

INSERT INTO departamentos (nombre, descripcion) VALUES
('Recursos Hídricos', 'Gestión y control de recursos hídricos provinciales'),
('Administración', 'Gestión administrativa y financiera'),
('Obras', 'Planificación y ejecución de obras hídricas'),
('Legal', 'Asesoramiento jurídico y legal'),
('Sistemas', 'Tecnología de la información y sistemas'),
('Inspección', 'Control y fiscalización de uso de agua');

-- ========================================
-- 5. CREAR USUARIO ADMINISTRATIVO INICIAL
-- ========================================
-- Usuario: admin
-- Contraseña: admin123
-- IMPORTANTE: Cambiar esta contraseña después del primer login

INSERT INTO usuario (nombre, apellido, dni, email, direccion, telefono, usuario, contraseña, id_rol)
VALUES (
    'Administrador',
    'Sistema',
    12345678,
    'admin@dpa.gob.ar',
    'Dirección Provincial del Agua - Tucumán',
    '2614000000',
    'admin',
    'admin123', -- El sistema la hasheará automáticamente en el primer login
    @id_admin
);

-- ========================================
-- CONSULTAS DE VERIFICACIÓN
-- ========================================

-- Ver todos los permisos creados
SELECT 'PERMISOS CREADOS:' as Tabla;
SELECT * FROM permisos ORDER BY id_permiso;

-- Ver todos los roles creados
SELECT 'ROLES CREADOS:' as Tabla;
SELECT * FROM roles ORDER BY id_rol;

-- Ver todos los departamentos creados
SELECT 'DEPARTAMENTOS CREADOS:' as Tabla;
SELECT * FROM departamentos ORDER BY id_departamento;

-- Ver permisos asignados a cada rol
SELECT 'PERMISOS POR ROL:' as Tabla;
SELECT 
    r.nombre as Rol,
    p.nombre as Permiso,
    p.descripcion as Descripcion
FROM rol_permisos rp
JOIN roles r ON rp.id_rol = r.id_rol
JOIN permisos p ON rp.id_permiso = p.id_permiso
ORDER BY r.nombre, p.nombre;

-- Ver usuario administrativo creado
SELECT 'USUARIO ADMINISTRATIVO INICIAL:' as Tabla;
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.usuario,
    u.email,
    r.nombre AS rol
FROM usuario u
INNER JOIN roles r ON r.id_rol = u.id_rol;
