
UPDATE expedientes SET id_profesional_asignado = 5 WHERE id_expediente = 12;

UPDATE expedientes SET id_profesional_asignado = 7 WHERE id_expediente = 15;

SELECT id_expediente, numero_expediente, id_profesional_asignado FROM expedientes WHERE id_expediente IN (12, 15);


-- Para ejecutar este script desde MySQL CLI o Workbench, simplemente selecciona el bloque y presiona "Run" o ejecuta:
--
-- RUN:
-- UPDATE expedientes SET id_profesional_asignado = 5 WHERE id_expediente = 12;
-- UPDATE expedientes SET id_profesional_asignado = 7 WHERE id_expediente = 15;
-- SELECT id_expediente, numero_expediente, id_profesional_asignado FROM expedientes WHERE id_expediente IN (12, 15);
