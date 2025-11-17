# SOLUCIÓN AL PROBLEMA DE LOGIN

## El problema
No puedes ingresar con las credenciales existentes después de la migración de `tipo_usuario` a `id_rol`.

## Diagnóstico paso a paso

### 1. Abrir MySQL
```bash
mysql -u root -p
```

### 2. Verificar el estado actual
```sql
USE sigedex;

-- Ver estructura de la tabla usuario
SHOW COLUMNS FROM usuario;

-- Ver usuarios existentes
SELECT id_usuario, usuario, nombre, id_rol FROM usuario;

-- Ver roles disponibles
SELECT id_rol, nombre FROM roles;
```

## Soluciones según el escenario

### ESCENARIO A: La columna tipo_usuario todavía existe

Si al ejecutar `SHOW COLUMNS FROM usuario` ves la columna `tipo_usuario`, ejecuta:

```bash
cd backEnd
mysql -u root -p sigedex < configDB/migrar_tipo_usuario_a_rol.sql
```

### ESCENARIO B: Ya no existe tipo_usuario pero usuarios no tienen id_rol

Si los usuarios muestran `NULL` en `id_rol`, ejecuta:

```bash
cd backEnd
mysql -u root -p sigedex < configDB/corregir_usuarios.sql
```

O manualmente en MySQL:

```sql
USE sigedex;

-- Asignar rol Presentante a usuarios sin rol
UPDATE usuario u
SET u.id_rol = (SELECT r.id_rol FROM roles r WHERE r.nombre = 'Presentante' LIMIT 1)
WHERE u.id_rol IS NULL AND u.usuario != 'admin';

-- Recrear usuario admin con rol correcto
DELETE FROM usuario WHERE usuario = 'admin';

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
```

### ESCENARIO C: Los roles no existen

Si la consulta `SELECT * FROM roles;` no muestra datos, ejecuta:

```bash
cd backEnd
mysql -u root -p sigedex < configDB/init_datos.sql
```

## Verificación final

Después de aplicar la solución, verifica:

```sql
USE sigedex;

SELECT 
    u.id_usuario,
    u.usuario,
    u.contraseña,
    u.nombre,
    r.nombre as rol
FROM usuario u
LEFT JOIN roles r ON u.id_rol = r.id_rol;
```

**Deberías ver:**
- Todos los usuarios con un rol asignado (columna `rol` no NULL)
- Usuario 'admin' con contraseña 'admin123' y rol 'Administrativo'

## Credenciales de prueba

Después de la corrección, intenta ingresar con:
- **Usuario:** admin
- **Contraseña:** admin123

## Si aún no funciona

1. Abre la consola del navegador (F12) en la página de login
2. Intenta iniciar sesión
3. Revisa los mensajes de error en la consola
4. Busca mensajes que digan:
   - "Datos del usuario: ..."
   - "Rol obtenido: ..."
   - Errores de red o backend

5. Verifica que el backend esté corriendo:
```bash
cd backEnd
node index.js
```

6. Verifica que el frontend esté corriendo:
```bash
cd frontEnd
npm run dev
```

## Notas importantes

- La contraseña 'admin123' está en texto plano y se hasheará automáticamente en el primer login exitoso
- Todos los usuarios DEBEN tener un `id_rol` asignado para poder iniciar sesión
- Los roles disponibles son: Administrativo, Director, Técnico, Jurídico, Presentante, Admin TI
