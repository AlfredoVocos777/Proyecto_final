# MANUAL DE USUARIO
# SIGEDEX — Sistema de Gestión de Expedientes Digitales
## Dirección Provincial del Agua — Tucumán

---

> **Versión:** 2.0  
> **Fecha:** Abril 2026  
> **Proyecto:** Trabajo Final de Carrera  

---

## ÍNDICE

1. [Introducción](#1-introducción)
2. [Requisitos del sistema](#2-requisitos-del-sistema)
3. [Acceso al sistema](#3-acceso-al-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Módulo Presentante](#5-módulo-presentante)
   - 5.1 Registrarse en el sistema
   - 5.2 Crear nuevo trámite — Datos del expediente
   - 5.3 Crear nuevo trámite — Pago del arancel (Mercado Pago)
   - 5.4 Confirmación del expediente
   - 5.5 Consultar estado de expedientes
   - 5.6 Editar perfil de usuario
6. [Módulo Administrativo](#6-módulo-administrativo)
   - 6.1 Expedientes en revisión
   - 6.2 Realizar pase a técnico
   - 6.3 Cargar observación para el presentante
   - 6.4 Deshacer pase
   - 6.5 Generar reporte PDF
7. [Módulo Técnico](#7-módulo-técnico)
   - 7.1 Bandeja de entrada
   - 7.2 Recepcionar expedientes
   - 7.3 Ver documentos y cargar informe
   - 7.4 Realizar pase al área jurídica
   - 7.5 Deshacer pase
   - 7.6 Consultar expedientes
8. [Módulo Jurídico](#8-módulo-jurídico)
   - 8.1 Bandeja de entrada
   - 8.2 Recepcionar expedientes
   - 8.3 Ver documentos y cargar dictamen
   - 8.4 Realizar pase a la Dirección
   - 8.5 Deshacer pase
   - 8.6 Consultar expedientes
9. [Módulo Director](#9-módulo-director)
   - 9.1 Bandeja de entrada
   - 9.2 Recepcionar expedientes
   - 9.3 Revisión completa del expediente
   - 9.4 Aprobar o rechazar expediente
   - 9.5 Consultar todos los expedientes
10. [Notificaciones automáticas](#10-notificaciones-automáticas)
11. [Generación de reportes en PDF](#11-generación-de-reportes-en-pdf)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)
13. [Glosario](#13-glosario)

---

## 1. Introducción

**SIGEDEX** es un sistema web de gestión de expedientes digitales desarrollado para la **Dirección Provincial del Agua (D.P.A.) de Tucumán**. Su objetivo es digitalizar y agilizar el circuito administrativo de los trámites, reemplazando el proceso en papel por un flujo completamente electrónico, incluyendo la gestión del pago del arancel de inicio.

### ¿Qué permite SIGEDEX?

- Registrarse como usuario y gestionar el propio perfil en línea.
- Crear y presentar expedientes con pago del arancel integrado (Mercado Pago).
- Seguir el estado de un trámite en tiempo real con observaciones por área.
- Asignar expedientes a profesionales técnicos con informe administrativo.
- Registrar análisis, informes y documentación adjunta en cada etapa.
- Aprobar o rechazar expedientes desde la Dirección.
- Notificar automáticamente al presentante sobre el resultado de su trámite.
- Generar reportes en PDF de las distintas bandejas de trabajo.

### Flujo general del expediente

```
Presentante se registra y crea el trámite (+ paga el arancel)
        ↓
Administrativo realiza el pase al Técnico (con informe)
        ↓
Técnico recepciona, analiza y realiza el pase al área Jurídica
        ↓
Jurídico recepciona, elabora dictamen y realiza el pase a la Dirección
        ↓
Director revisa toda la documentación y aprueba o rechaza
        ↓
Presentante recibe notificación por correo electrónico
```

---

## 2. Requisitos del sistema

| Componente | Requisito mínimo |
|---|---|
| Navegador web | Google Chrome 90+, Firefox 88+, Edge 90+ |
| Conexión a Internet | 1 Mbps o superior |
| Resolución de pantalla | 1280 × 720 px o superior |
| Dispositivo | PC de escritorio, notebook o tablet |

> **Nota:** No se requiere instalación de software adicional. El sistema funciona completamente desde el navegador web.

---

## 3. Acceso al sistema

### 3.1 Iniciar sesión

Para ingresar al sistema, el usuario debe abrir su navegador y acceder a la URL del sistema.

**[CAPTURA: pantalla de login]**

1. Ingresar el **correo electrónico** en el campo correspondiente.
2. Ingresar la **contraseña**.
3. Hacer clic en el botón **"Iniciar sesión"**.

> Si los datos son correctos, el sistema redireccionará automáticamente a la portada del rol correspondiente al usuario.

---

### 3.2 Recuperación de contraseña

En caso de haber olvidado la contraseña:

1. Hacer clic en el enlace **"¿Olvidaste tu contraseña?"** en la pantalla de inicio de sesión.
2. Ingresar el correo electrónico registrado.
3. El sistema enviará un enlace de recuperación al correo indicado.
4. Seguir el enlace recibido y establecer una nueva contraseña.

**[CAPTURA: pantalla de recuperación de contraseña]**

---

### 3.3 Cerrar sesión

Para salir del sistema de forma segura, hacer clic en el botón **"Salir"** o **"Cerrar sesión"** que se encuentra en la barra de navegación superior.

---

## 4. Roles y permisos

El sistema cuenta con cinco roles de usuario, cada uno con acceso a las funcionalidades correspondientes a su área de trabajo:

| Rol | Descripción |
|---|---|
| **Presentante** | Usuario externo que crea y consulta sus propios expedientes. |
| **Administrativo** | Gestiona la asignación inicial de expedientes a los profesionales. |
| **Técnico** | Realiza el análisis técnico del expediente y lo deriva al área jurídica. |
| **Jurídico** | Elabora el dictamen jurídico y lo eleva a la Dirección. |
| **Director** | Toma la decisión final de aprobación o rechazo del expediente. |

> Los roles son asignados por el administrador del sistema. Un usuario solo puede acceder a las funciones habilitadas para su rol.

---

## 5. Módulo Presentante

El presentante es el usuario externo que inicia los trámites administrativos. Al ingresar al sistema visualizará su portada personal con acceso a todas sus funciones.

**[CAPTURA: portada del Presentante]**

---

### 5.1 Registrarse en el sistema

Antes de poder crear un expediente, el usuario debe registrarse. Para hacerlo:

1. En la pantalla de inicio, hacer clic en **"Registrarse"** o **"Crear cuenta"**.

**[CAPTURA: pantalla de inicio con botón de registro]**

2. Completar el formulario con todos los datos requeridos:

| Campo | Descripción |
|---|---|
| **Nombre** | Nombre del usuario |
| **Apellido** | Apellido del usuario |
| **DNI** | Número de documento nacional de identidad |
| **Email** | Correo electrónico (será usado para iniciar sesión y recibir notificaciones) |
| **Dirección** | Domicilio del usuario |
| **Teléfono** | Número de teléfono de contacto |
| **Usuario** | Nombre de usuario para el sistema |
| **Contraseña** | Contraseña de acceso |

**[CAPTURA: formulario de registro completo]**

3. Hacer clic en **"Guardar"**.

Si el registro es exitoso, el sistema mostrará un mensaje de bienvenida con el nombre y apellido ingresados y redirigirá automáticamente a la pantalla de inicio de sesión.

**[CAPTURA: mensaje de bienvenida luego del registro exitoso]**

> Se puede registrar tanto como **usuario común (Presentante)** como **usuario profesional**, según corresponda.

---

### 5.2 Crear nuevo trámite — Datos del expediente

El proceso de creación de un expediente se realiza en tres pasos guiados por una **línea de tiempo** visible en pantalla.

**Paso 1 — Datos del expediente:**

1. Desde la portada, hacer clic en **"Nuevo Trámite"**.

**[CAPTURA: botón "Nuevo Trámite" en la portada]**

2. Completar el formulario con la información del trámite:
   - **Tipo de expediente:** seleccionar el tipo de trámite de la lista desplegable.
   - **Ubicación:** indicar la ubicación o predio al que refiere el expediente.
   - **Descripción:** detallar el objeto del trámite.
   - **Prioridad:** seleccionar entre Alta, Media o Baja.

**[CAPTURA: formulario de datos del expediente — Paso 1]**

3. Adjuntar la documentación requerida haciendo clic en **"Seleccionar archivos"**. Se pueden adjuntar múltiples archivos (PDF, JPG, PNG, DOC, DOCX).

**[CAPTURA: sección de carga de archivos con archivos seleccionados]**

4. Hacer clic en **"Continuar"** para avanzar al paso de pago.

---

### 5.3 Crear nuevo trámite — Pago del arancel (Mercado Pago)

**Paso 2 — Pago:**

En esta pantalla se muestra el **resumen del trámite** con el nombre del usuario, tipo de expediente y el importe total a pagar.

**[CAPTURA: pantalla de pago con resumen del expediente]**

También se listan los archivos adjuntos seleccionados en el paso anterior.

**[CAPTURA: sección de archivos adjuntos en la pantalla de pago]**

#### Pagar con Mercado Pago

1. Hacer clic en el botón de **Mercado Pago**.

**[CAPTURA: botón de pago con Mercado Pago]**

2. El sistema abrirá automáticamente el portal de pago de Mercado Pago en una nueva pestaña del navegador.

**[CAPTURA: portal de pago de Mercado Pago en nueva pestaña]**

3. Completar el pago en la plataforma de Mercado Pago siguiendo sus instrucciones.
4. Una vez abonado, SIGEDEX mostrará un campo para ingresar el **número de comprobante u operación** que figura en el recibo de Mercado Pago.

**[CAPTURA: campo de ingreso del número de comprobante]**

5. Ingresar el número de comprobante y hacer clic en **"Confirmar Pago"**.

> **Pago en efectivo y tarjeta:** Las opciones "Pago con tarjeta" y "Pago Fácil / efectivo" se encuentran disponibles próximamente.

---

### 5.4 Confirmación del expediente

**Paso 3 — Confirmación:**

Luego de confirmar el pago, el sistema crea el expediente en la base de datos y muestra la pantalla de confirmación con:

- El mensaje **"¡Pago Exitoso!"**
- El **número de expediente** generado (ej.: `2026/0001`)

**[CAPTURA: pantalla de confirmación con número de expediente]**

> **Importante:** Anote el número de expediente. Podrá utilizarlo en cualquier momento para rastrear el estado de su trámite desde la sección "Consulta".

El botón **"Volver a la portada"** regresa al inicio. A partir de este momento el expediente queda disponible para que el área administrativa lo derive al profesional correspondiente.

---

### 5.5 Consultar estado de expedientes

Para verificar el estado de sus trámites:

1. Desde la portada, hacer clic en **"Mis Expedientes"** o ir a la sección **"Consulta"**.

**[CAPTURA: acceso a la sección Mis Expedientes]**

2. La tabla mostrará únicamente los expedientes del usuario logueado, con:
   - Número de expediente
   - Tipo de trámite
   - Descripción
   - Estado actual
   - Fecha de creación
   - Acceso al detalle

**[CAPTURA: tabla de expedientes del presentante]**

Los estados posibles son:

| Estado | Color | Significado |
|---|---|---|
| **Pendiente** | 🟡 Amarillo | El expediente aguarda asignación. |
| **En revisión** | 🔵 Azul | El expediente está siendo procesado por los profesionales. |
| **Aprobado** | 🟢 Verde | La Dirección aprobó el expediente. |
| **Rechazado** | 🔴 Rojo | La Dirección rechazó el expediente. |
| **Archivado** | ⚫ Gris | El expediente fue archivado. |

3. Hacer clic en **"Ver"** junto a un expediente para abrir el modal de detalle.

**[CAPTURA: modal de detalle del expediente abierto]**

En el modal de detalle el presentante puede ver:
- Información general del expediente
- Documentos adjuntos con opción de descarga
- **Observaciones** cargadas por el área Administrativa, Técnica, Jurídica y de Dirección
- Historial completo de movimientos (con fecha, acción y responsable)

**[CAPTURA: sección de observaciones por rol dentro del modal de detalle]**

**[CAPTURA: historial de movimientos dentro del modal de detalle]**

> El presentante también recibirá un **correo electrónico automático** al momento en que la Dirección tome la decisión final sobre su expediente.

---

### 5.6 Editar perfil de usuario

El presentante puede actualizar sus datos personales en cualquier momento:

1. En la sección de **Consulta**, buscar y hacer clic en el botón **"Mi Perfil"**.

**[CAPTURA: botón "Mi Perfil" en la sección de Consulta]**

2. Se abrirá el modal de perfil con los datos actuales precargados:
   - Nombre y apellido
   - Email
   - Teléfono
   - Dirección
   - Nombre de usuario
   - Campo de contraseña (dejar en blanco para no cambiarla)

**[CAPTURA: modal de edición de perfil con datos precargados]**

3. Modificar los campos deseados y hacer clic en **"Guardar"**.

Si la actualización es exitosa, el sistema muestra el mensaje **"Perfil actualizado correctamente ✅"** y cierra el modal automáticamente al cabo de un momento.

> Si el campo contraseña se deja vacío, la contraseña actual no se modifica.

---

## 6. Módulo Administrativo

El usuario Administrativo gestiona la recepción de expedientes y su derivación al área técnica correspondiente. Es la primera instancia interna del circuito.

**[CAPTURA: portada del Administrativo]**

---

### 6.1 Expedientes en revisión

Al ingresar, el Administrativo accede a la página **"Expedientes en Revisión"** donde se listan todos los expedientes activos del sistema.

**[CAPTURA: listado de expedientes en revisión]**

La tabla muestra:
- Número de expediente
- Tipo de trámite
- Estado actual (con indicador de color)
- Presentante
- Fecha de creación
- Profesional asignado (si ya fue derivado)
- Botones de acción

#### Buscar y filtrar expedientes

En la parte superior de la tabla se puede:
- **Buscar** por número, nombre del presentante o descripción usando el campo de búsqueda libre.
- **Filtrar por estado** mediante el selector desplegable (Pendiente, En revisión, Aprobado, Rechazado, etc.).

**[CAPTURA: barra de búsqueda y filtro de estado]**

---

### 6.2 Realizar pase a técnico

Para derivar un expediente al área técnica:

1. Hacer clic en el botón **"Realizar Pase"** junto al expediente.

**[CAPTURA: botón "Realizar Pase" en la tabla]**

2. Se abrirá el modal **"Realizar Pase"** con la información del expediente y tres secciones:

   **a) Datos del expediente:** resumen con tipo, estado, presentante y fecha.

   **b) Informe Administrativo:** campo para adjuntar uno o más archivos como parte del informe de pase. Hacer clic en "Adjuntar archivo" y seleccionar los documentos.

   **c) Técnico destino:** seleccionar el técnico destinatario del pase de la lista desplegable (campo obligatorio marcado con ★).

**[CAPTURA: modal de pase con datos, campo de adjunto e informe, y selector de técnico]**

3. Hacer clic en **"Confirmar Pase"**.

Si el pase es exitoso, el sistema muestra el mensaje de confirmación con el nombre del técnico asignado, actualiza el estado del expediente a **"En revisión"** y envía una notificación al presentante.

**[CAPTURA: mensaje de éxito del pase]**

> El botón "Confirmar Pase" permanece deshabilitado hasta que se seleccione un técnico.

---

### 6.3 Cargar observación para el presentante

El Administrativo puede registrar observaciones visibles para el presentante al abrir el detalle de un expediente:

1. Hacer clic en el botón **"Ver"** o en el número de expediente para abrir el modal de detalle.

**[CAPTURA: botón "Ver" para abrir el detalle del expediente]**

2. En el modal de detalle se visualizan:
   - Datos generales del expediente (número, tipo, descripción, estado, prioridad, presentante, teléfono del presentante, profesional asignado)
   - Documentos adjuntos con botón "Ver" para cada uno
   - Campo de texto **"Observaciones para el Presentante"**
   - Historial de acciones

**[CAPTURA: modal de detalle del expediente con sección de observación]**

3. Escribir la observación en el campo de texto y hacer clic en **"Guardar Observación"**.

El sistema registrará la observación y también generará una entrada en el historial del expediente con la acción "Observación Administrativa".

**[CAPTURA: lista de observaciones guardadas en el modal]**

**[CAPTURA: tabla de historial de acciones dentro del modal de detalle]**

---

### 6.4 Deshacer pase

Si se necesita revertir un pase reciente (mientras el técnico no lo haya recepcionado):

1. Hacer clic en el botón **"↩ Deshacer Pase"** junto al expediente correspondiente.

**[CAPTURA: botón "Deshacer Pase" en la tabla]**

2. Se abrirá el modal de confirmación que muestra los datos del expediente y la advertencia de que el expediente volverá al estado **"En revisión"** y se quitará la asignación actual.

**[CAPTURA: modal de confirmación "Deshacer Pase"]**

3. Hacer clic en **"Sí, deshacer pase"** para confirmar.

> Esta acción no es reversible una vez confirmada. Si el técnico ya recepcionó el expediente, la opción no estará disponible.

---

### 6.5 Generar reporte PDF

Para obtener un reporte en PDF del listado actual:

1. Hacer clic en el botón **"🖨️ Reporte PDF"** en la parte superior de la página.

**[CAPTURA: botón "Reporte PDF" en la página de expedientes en revisión]**

2. El sistema generará el PDF automáticamente con la tabla de expedientes visible en pantalla (incluyendo los filtros aplicados), la fecha de generación y la cantidad de expedientes.

**[CAPTURA: vista previa del PDF generado]**

---

## 7. Módulo Técnico

El usuario Técnico recibe los expedientes asignados desde Administración, realiza el análisis técnico, carga su informe y los deriva al área jurídica.

**[CAPTURA: portada del Técnico]**

---

### 7.1 Bandeja de entrada

La bandeja muestra los expedientes asignados al usuario técnico que aún no han sido recepcionados.

**[CAPTURA: bandeja de entrada del Técnico con expedientes pendientes]**

Cada fila muestra:
- Número de expediente
- Tipo de trámite
- Descripción
- Nombre del presentante
- Fecha del pase
- Acceso a documentos adjuntos
- Botones de acción

---

### 7.2 Recepcionar expedientes

La recepción formal confirma que el técnico tomó conocimiento del expediente y lo acepta para análisis.

1. Seleccionar uno o varios expedientes mediante los **casilleros de verificación**.
2. Hacer clic en **"Recepcionar Seleccionados"**.

**[CAPTURA: casilleros de selección y botón "Recepcionar Seleccionados"]**

3. Ingresar una observación opcional y confirmar.

Una vez recepcionado, el expediente quedará marcado con una insignia verde **"✓ Recepcionado"** y habilitará el botón para realizar el pase al área jurídica.

**[CAPTURA: expediente marcado como recepcionado en la bandeja]**

---

### 7.3 Ver documentos y cargar informe

Para consultar la documentación del expediente y registrar el informe técnico:

1. Hacer clic en **"Ver Documentos"** junto al expediente.

**[CAPTURA: botón "Ver Documentos" en la bandeja]**

2. En el modal se puede:
   - **Consultar documentos adjuntos** por el presentante (con botón para descargarlos o visualizarlos).
   - **Subir nuevos archivos:** seleccionar los archivos y hacer clic en "Guardar documentos". Los documentos subidos se asocian al usuario técnico.
   - **Cargar observación:** redactar el informe o comentario en el campo de texto y hacer clic en "Guardar observación". La observación quedará visible para todos los roles y para el presentante.

**[CAPTURA: modal de documentos con lista de archivos y campo de observación]**

---

### 7.4 Realizar pase al área jurídica

Una vez concluido el análisis técnico:

1. En la bandeja (sección **"Realizar Pase"**), hacer clic en **"Realizar Pase"** sobre el expediente recepcionado.

**[CAPTURA: botón "Realizar Pase" activo sobre expediente recepcionado]**

2. En el modal completar:
   - **Informe / Adjunto:** adjuntar el archivo del informe técnico.
   - **Destinatario:** seleccionar el profesional jurídico de la lista desplegable.

**[CAPTURA: modal de pase al área jurídica con adjunto y selector de destinatario]**

3. Hacer clic en **"Confirmar Pase"**.

El expediente pasará al área jurídica y el sistema enviará una notificación al presentante informando el avance.

---

### 7.5 Deshacer pase

Si el jurídico aún no recepcionó el expediente y se necesita revertir el pase:

1. Hacer clic en **"↩ Deshacer Pase"** junto al expediente.
2. Confirmar la acción en el modal de advertencia.

**[CAPTURA: modal de confirmación "Deshacer Pase" en el área técnica]**

> El expediente volverá al estado recepcionado y podrá ser realizado el pase nuevamente.

---

### 7.6 Consultar expedientes

La sección **"Consultar"** permite visualizar todos los expedientes del sistema con filtros de búsqueda:

- Por número de expediente
- Por estado
- Por nombre del presentante o descripción

**[CAPTURA: sección de consulta del Técnico con filtros activos]**

---

## 8. Módulo Jurídico

El usuario Jurídico recibe los expedientes derivados desde el área técnica, elabora el dictamen jurídico y los eleva a la Dirección para la decisión final.

**[CAPTURA: portada del Jurídico]**

---

### 8.1 Bandeja de entrada

La bandeja muestra los expedientes pendientes de recepción asignados al área jurídica, con el informe técnico ya disponible para consulta.

**[CAPTURA: bandeja de entrada del Jurídico]**

---

### 8.2 Recepcionar expedientes

El procedimiento es idéntico al del Técnico:

1. Seleccionar los expedientes a recepcionar mediante los casilleros de verificación.
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. Confirmar la recepción.

**[CAPTURA: selección y botón de recepción en el área jurídica]**

---

### 8.3 Ver documentos y cargar dictamen

1. Hacer clic en **"Ver Documentos"** sobre el expediente.
2. En el modal consultar:
   - Los documentos adjuntos del presentante.
   - El informe técnico y los archivos cargados por el área técnica.
3. Redactar el dictamen jurídico en el campo **"Observaciones"** y hacer clic en "Guardar observación".
4. Subir el archivo del dictamen jurídico haciendo clic en "Guardar documentos".

**[CAPTURA: modal de documentos con informe técnico visible y campo de dictamen jurídico]**

---

### 8.4 Realizar pase a la Dirección

Una vez elaborado el dictamen:

1. En la bandeja, hacer clic en **"Realizar Pase"** sobre el expediente recepcionado.
2. En el modal completar:
   - **Informe / Adjunto:** adjuntar el archivo del dictamen jurídico.
   - **Destinatario:** seleccionar el Director de la lista desplegable.
3. Hacer clic en **"Confirmar Pase"**.

**[CAPTURA: modal de pase jurídico con adjunto del dictamen y selector de Director]**

El expediente pasará a la Dirección para la resolución final.

---

### 8.5 Deshacer pase

Si el Director aún no recepcionó el expediente y se necesita corregir algo:

1. Hacer clic en **"↩ Deshacer Pase"** junto al expediente.
2. Confirmar la acción en el modal de advertencia.

**[CAPTURA: modal de confirmación "Deshacer Pase" en el área jurídica]**

---

### 8.6 Consultar expedientes

La sección **"Consultar"** permite buscar expedientes por número, estado, presentante o descripción.

**[CAPTURA: sección de consulta del área jurídica]**

---

## 9. Módulo Director

El Director es el responsable de tomar la decisión final sobre cada expediente. Cuenta con la vista completa de todos los documentos, el historial de movimientos y los informes técnico y jurídico.

**[CAPTURA: portada del Director]**

---

### 9.1 Bandeja de entrada

La bandeja del Director muestra los expedientes recibidos que aún no han sido resueltos.

**[CAPTURA: bandeja de entrada del Director]**

---

### 9.2 Recepcionar expedientes

1. Seleccionar los expedientes a recepcionar.
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. Opcionalmente ingresar observaciones de recepción.
4. Confirmar.

**[CAPTURA: recepción de expedientes en la Dirección]**

---

### 9.3 Revisión completa del expediente

Antes de tomar una decisión, el Director puede revisar en detalle toda la información del expediente.

1. Ir a la sección **"Resolver"** en la barra de navegación.
2. Hacer clic en **"Ver docs"** para consultar la documentación sin tomar ninguna acción.
3. Hacer clic en **"Resolución"** para abrir el panel de revisión completa.

**[CAPTURA: tabla de expedientes en "Resolver" con botones "Ver docs" y "Resolución"]**

El panel de revisión muestra:

- **Información del expediente:** número, presentante, tipo, descripción, prioridad y ubicación.
- **Documentación adjunta:** archivos organizados por rol (Presentante, Técnico, Jurídico).
- **Observaciones de cada área.**
- **Historial de movimientos:** todas las acciones realizadas sobre el expediente con fecha, usuario y comentario.
- **Formulario de decisión final.**

**[CAPTURA: panel de revisión completa con información del expediente]**

**[CAPTURA: sección de documentos agrupados por rol dentro del panel]**

**[CAPTURA: historial de movimientos del expediente]**

---

## 9. Módulo Director

El Director es el responsable de tomar la decisión final sobre cada expediente. Cuenta con acceso completo a todos los documentos, el historial de movimientos y los informes técnico y jurídico antes de resolver.

**[CAPTURA: portada del Director]**

---

### 9.1 Bandeja de entrada

La bandeja muestra los expedientes que llegaron a la Dirección y aún no han sido resueltos.

**[CAPTURA: bandeja de entrada del Director]**

---

### 9.2 Recepcionar expedientes

1. Seleccionar los expedientes a recepcionar mediante los casilleros de verificación.
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. Opcionalmente ingresar una observación de recepción.
4. Confirmar.

**[CAPTURA: recepción de expedientes en la Dirección]**

---

### 9.3 Revisión completa del expediente

Antes de tomar una decisión, el Director puede revisar en profundidad toda la información del expediente.

1. Ir a la sección **"Resolver"** en la barra de navegación.

**[CAPTURA: sección "Resolver" en la barra de navegación del Director]**

2. Hacer clic en **"Ver docs"** para consultar únicamente la documentación sin tomar ninguna acción.

**[CAPTURA: botón "Ver docs" en la tabla de expedientes]**

3. Hacer clic en **"Resolución"** para abrir el panel de revisión completa con la posibilidad de resolver.

**[CAPTURA: botón "Resolución" en la tabla de expedientes]**

El panel de revisión completa muestra:

| Sección | Contenido |
|---|---|
| **Información del expediente** | Número, tipo, descripción, estado, prioridad, ubicación, presentante |
| **Documentación adjunta** | Archivos agrupados por rol: Presentante, Administrativo, Técnico, Jurídico |
| **Observaciones por área** | Comentarios registrados por cada área durante el proceso |
| **Historial de movimientos** | Registro cronológico de todas las acciones con fecha, responsable y comentario |
| **Decisión final** | Formulario para aprobar o rechazar con campo de fundamentos |

**[CAPTURA: panel de revisión con información del expediente]**

**[CAPTURA: documentación adjunta organizada por rol]**

**[CAPTURA: observaciones de cada área dentro del panel]**

**[CAPTURA: historial completo de movimientos]**

---

### 9.4 Aprobar o rechazar expediente

Dentro del panel de revisión, en la sección **"Decisión Final del Director"**:

1. Opcionalmente subir un archivo de resolución oficial haciendo clic en **"Subir Documentos"**.

**[CAPTURA: sección de carga de documentos de resolución oficial]**

2. Seleccionar la decisión:
   - Hacer clic en el botón **"APROBAR"** o **"RECHAZAR"**.

**[CAPTURA: botones de decisión "APROBAR" y "RECHAZAR"]**

3. Redactar en el campo de texto los **fundamentos de la aprobación** o los **motivos del rechazo**.

**[CAPTURA: campo de fundamentos de la decisión completado]**

4. Hacer clic en **"Confirmar Aprobación"** o **"Confirmar Rechazo"** según corresponda.

> ⚠️ **Esta acción es definitiva.** Una vez confirmada, el expediente cambia su estado y se notifica automáticamente al presentante por correo electrónico. No puede revertirse.

**[CAPTURA: mensaje de éxito luego de confirmar la decisión final]**

#### ¿Qué ocurre después de resolver?

- El expediente **desaparece del panel "Resolver"** de forma inmediata.
- El estado se actualiza a **"Aprobado"** o **"Rechazado"** en todo el sistema.
- El presentante recibe un **correo electrónico automático** con el resultado y las observaciones del Director.
- El expediente queda disponible en la sección de **Consulta** con su estado final.

---

### 9.5 Consultar todos los expedientes

La sección **"Consulta"** permite al Director visualizar todos los expedientes del sistema, incluyendo los ya resueltos, con filtros de búsqueda y estado.

**[CAPTURA: sección de consulta del Director con tabla completa de expedientes]**

---

## 10. Notificaciones automáticas

El sistema envía notificaciones por **correo electrónico** de forma automática en dos momentos clave del circuito:

### 10.1 Notificación de pase a técnico

Cuando el Administrativo deriva un expediente al área técnica, el presentante recibe un correo informando que su trámite fue recibido y se encuentra en proceso de análisis, con el nombre del técnico asignado.

### 10.2 Notificación de decisión final

Cuando el Director aprueba o rechaza un expediente, el presentante recibe automáticamente un correo con:

- El número de expediente.
- El resultado de la decisión (APROBADO o RECHAZADO).
- Las observaciones o fundamentos del Director.

**Ejemplo de correo de aprobación:**

> **Asunto:** ✅ Expediente 2026/0007 — APROBADO  
> Hola **Juan Pérez**,  
> Su expediente N° **2026/0007** ha sido **APROBADO ✅** por la Dirección.  
> **Observación:** Se autoriza la obra solicitada conforme a la normativa vigente.

**Ejemplo de correo de rechazo:**

> **Asunto:** ❌ Expediente 2026/0007 — RECHAZADO  
> Hola **Juan Pérez**,  
> Su expediente N° **2026/0007** ha sido **RECHAZADO ❌** por la Dirección.  
> **Observación:** Falta la documentación técnica requerida por el artículo 5°.

---

## 11. Generación de reportes en PDF

Los usuarios con roles internos (Administrativo, Técnico, Jurídico y Director) pueden generar un **reporte en PDF** de su vista actual de expedientes.

1. Hacer clic en el botón **"🖨️ Reporte PDF"** en la parte superior de la página.

**[CAPTURA: botón "Reporte PDF"]**

2. El sistema generará el documento e iniciará la descarga automática.

El reporte incluye:
- La tabla de expedientes visible en pantalla (con los filtros aplicados)
- Fecha de generación del reporte
- Cantidad total de expedientes listados

**[CAPTURA: ejemplo del PDF generado con la tabla de expedientes]**

---

## 12. Preguntas frecuentes

**¿Puedo editar los datos de mi expediente después de enviarlo?**  
No. Una vez creado y enviado, el expediente queda bajo gestión administrativa y no puede ser modificado por el presentante. Si existe algún error, deberá comunicarse con el área administrativa.

**¿Cómo sé si mi expediente avanzó?**  
Puede consultar el estado en cualquier momento desde la sección "Mis Expedientes" o "Consulta". También recibirá un correo electrónico automático al momento que el Administrativo lo derive al técnico y cuando la Dirección tome la decisión final.

**¿Puedo presentar más de un expediente?**  
Sí. El sistema permite crear tantos expedientes como sean necesarios. Cada uno tendrá un número único generado automáticamente.

**¿Qué formatos de archivo se admiten?**  
El sistema acepta archivos PDF, imágenes (JPG, PNG) y documentos de texto (DOC, DOCX). Se recomienda el uso de PDF para garantizar la integridad del documento.

**¿Qué hago si no recibo el correo de notificación?**  
Verifique la carpeta de correo no deseado (spam). Si el problema persiste, consulte el estado del expediente directamente en el sistema o comuníquese con el área administrativa de la D.P.A.

**¿Qué pasa si cierro la pestaña de Mercado Pago sin pagar?**  
El expediente queda en estado pendiente. Puede volver al proceso de pago y completarlo ingresando el comprobante una vez que realice el pago.

**¿Puedo deshacer un pase que ya realicé?**  
Sí, siempre que el destinatario no haya recepcionado aún el expediente. Una vez recepcionado, el pase no puede deshacerse desde el sistema.

**¿El sistema funciona desde el celular?**  
El sistema es compatible con navegadores móviles, aunque se recomienda el uso desde una computadora para una experiencia óptima.

---

## 13. Glosario

| Término | Definición |
|---|---|
| **Expediente** | Conjunto de documentos y actuaciones que se tramitan administrativamente sobre un asunto determinado. |
| **Número de expediente** | Identificador único generado por el sistema al crear un trámite. Formato: `AAAA/NNNN` (año/número correlativo). |
| **Pase** | Acción de derivar el expediente de un área de trabajo a otra. Cada pase se registra en el historial. |
| **Recepción** | Registro formal de que un usuario tomó conocimiento del expediente asignado e inicia su análisis. |
| **Estado** | Situación actual del expediente: Pendiente, En revisión, Aprobado, Rechazado o Archivado. |
| **Historial** | Registro cronológico de todos los movimientos y acciones realizadas sobre un expediente. |
| **Observación** | Comentario registrado por cualquier área durante el proceso, visible para el presentante. |
| **Informe técnico** | Documento elaborado por el área técnica con el resultado del análisis del expediente. |
| **Dictamen jurídico** | Documento elaborado por el área jurídica con la opinión legal sobre el expediente. |
| **Prioridad** | Nivel de urgencia asignado al expediente: Alta, Media o Baja. |
| **Arancel** | Pago obligatorio para iniciar el trámite, abonado a través de Mercado Pago. |
| **Comprobante** | Número de operación generado por Mercado Pago al completar el pago. |
| **D.P.A.** | Dirección Provincial del Agua, organismo de la provincia de Tucumán. |

---

## Anexo — Circuito completo del expediente

```
┌─────────────────────────────────────────────────────────────┐
│               CIRCUITO ADMINISTRATIVO SIGEDEX               │
└─────────────────────────────────────────────────────────────┘

  PRESENTANTE          ADMINISTRATIVO          TÉCNICO
      │                      │                    │
      ├─ Registro ──────────→│                    │
      ├─ Nuevo Trámite       │                    │
      ├─ Paga arancel        │                    │
      │  (Mercado Pago)      │                    │
      ├─ Expediente creado──→│                    │
      │                      ├─ Realiza Pase ────→│
      │                      │  (+ Inf. Admin.)   ├─ Recepciona
      │                      │                    ├─ Analiza
      │                      │                    ├─ Carga informe
      │                      │                    │
  PRESENTANTE           DIRECTOR              JURÍDICO
      │                      │                    │
      │                   ←──┤←── Recibe ─────────┤
      │                      │                    ├─ Recepciona
      │                      │                    ├─ Elabora dictamen
      │                      │                    ├─ Realiza pase
      │                      │
      │                      ├─ Recepciona
      │                      ├─ Revisa toda la doc.
      │                      ├─ Decide (Aprueba/Rechaza)
      │                      │
      │←── Notificación ─────┤
      │    por email         │
      │    (resultado final) │
```

---

*Este manual fue elaborado para el Trabajo Final de Carrera — Sistema SIGEDEX — Dirección Provincial del Agua, Tucumán, 2026.*
