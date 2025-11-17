-- Script para agregar asignaciones de ejemplo en historial_expediente
-- Esto simula pases de expedientes a usuarios técnicos/jurídicos

USE sigedex;

-- Verificar si existen usuarios técnicos o jurídicos
SELECT id_usuario, usuario, nombre, apellido, tipo_usuario 
FROM usuario 
WHERE tipo_usuario IN ('tecnico', 'juridico', 'técnico', 'jurídico')
LIMIT 5;

-- Verificar si existen expedientes
SELECT id_expediente, numero_expediente, estado_actual 
FROM expedientes 
WHERE estado_actual = 'en revisión'
LIMIT 5;

-- Insertar asignaciones de ejemplo (ajustar los IDs según tu base de datos)
-- Asume que existe un usuario técnico con id_usuario = 2 y un expediente con id_expediente = 1

-- Ejemplo 1: Asignación de expediente a usuario técnico
INSERT INTO historial_expediente 
  (id_expediente, fecha, accion, comentario, id_usuario_responsable, tipo_accion)
SELECT 
  e.id_expediente,
  NOW() AS fecha,
  'Asignación para revisión técnica' AS accion,
  'Expediente asignado para evaluación de factibilidad técnica' AS comentario,
  u.id_usuario AS id_usuario_responsable,
  'asignación' AS tipo_accion
FROM expedientes e
CROSS JOIN usuario u
WHERE u.tipo_usuario IN ('tecnico', 'técnico')
  AND e.estado_actual = 'en revisión'
  AND NOT EXISTS (
    SELECT 1 FROM historial_expediente h 
    WHERE h.id_expediente = e.id_expediente 
      AND h.id_usuario_responsable = u.id_usuario
      AND h.tipo_accion = 'asignación'
  )
LIMIT 2;

-- Ejemplo 2: Asignación de expediente a usuario jurídico
INSERT INTO historial_expediente 
  (id_expediente, fecha, accion, comentario, id_usuario_responsable, tipo_accion)
SELECT 
  e.id_expediente,
  NOW() - INTERVAL 1 DAY AS fecha,
  'Asignación para revisión jurídica' AS accion,
  'Expediente requiere análisis legal previo a aprobación' AS comentario,
  u.id_usuario AS id_usuario_responsable,
  'asignación' AS tipo_accion
FROM expedientes e
CROSS JOIN usuario u
WHERE u.tipo_usuario IN ('juridico', 'jurídico')
  AND e.estado_actual = 'en revisión'
  AND NOT EXISTS (
    SELECT 1 FROM historial_expediente h 
    WHERE h.id_expediente = e.id_expediente 
      AND h.id_usuario_responsable = u.id_usuario
      AND h.tipo_accion = 'asignación'
  )
LIMIT 2;

-- Verificar las asignaciones creadas
SELECT 
  h.id_historial,
  h.fecha,
  h.accion,
  h.tipo_accion,
  e.numero_expediente,
  u.usuario,
  u.nombre,
  u.apellido
FROM historial_expediente h
INNER JOIN expedientes e ON h.id_expediente = e.id_expediente
INNER JOIN usuario u ON h.id_usuario_responsable = u.id_usuario
WHERE h.tipo_accion = 'asignación'
ORDER BY h.fecha DESC
LIMIT 10;

SELECT '✓ Asignaciones de ejemplo agregadas correctamente' AS mensaje;
