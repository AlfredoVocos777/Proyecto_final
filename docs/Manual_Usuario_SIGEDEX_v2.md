# MANUAL DE USUARIO – SIGEDEX
## Sistema de Gestión de Expedientes Digitales

**Versión 1.0**

---

## Contenido

1. [INTRODUCCIÓN](#1-introducción)
   - 1.1 Propósito del Manual
   - 1.2 Audiencia
2. [REQUISITOS PARA ACCEDER AL SISTEMA](#2-requisitos-para-acceder-al-sistema)
   - 2.1 Acceso al Sistema
3. [PANTALLA DE INICIO DE SESIÓN / LOGIN](#3-pantalla-de-inicio-de-sesión--login)
   - 3.1 Descripción General
   - 3.2 Elementos de la Interfaz
   - 3.3 Procedimiento de Inicio de Sesión
   - 3.4 Registro de Usuario (Presentante)
   - 3.5 Recuperar Contraseña
4. [MÓDULO DEL PRESENTANTE](#4-módulo-del-presentante)
   - 4.1 Descripción General
   - 4.2 Crear Nuevo Trámite
   - 4.3 Consultar Estado de Expedientes
   - 4.4 Editar Perfil de Usuario
5. [MÓDULO DEL ADMINISTRATIVO](#5-módulo-del-administrativo)
   - 5.1 Descripción General
   - 5.2 Expedientes en Revisión
   - 5.3 Gestión de Usuarios
   - 5.4 Gestión de Departamentos
   - 5.5 Gestión de Roles y Permisos
   - 5.6 Gestión de Firmas Digitales
   - 5.7 Gestión de Tipos de Trámite
6. [MÓDULO DEL TÉCNICO](#6-módulo-del-técnico)
   - 6.1 Descripción General
   - 6.2 Bandeja de Recepción
   - 6.3 Realizar Pase
   - 6.4 Consultar Expedientes
   - 6.5 Deshacer Pase
7. [MÓDULO DEL JURÍDICO](#7-módulo-del-jurídico)
   - 7.1 Descripción General
   - 7.2 Bandeja de Recepción
   - 7.3 Realizar Pase al Director
   - 7.4 Consultar Expedientes
8. [MÓDULO DEL DIRECTOR](#8-módulo-del-director)
   - 8.1 Descripción General
   - 8.2 Bandeja y Recepción de Expedientes
   - 8.3 Revisión del Expediente
   - 8.4 Tomar Decisión Final
   - 8.5 Firma Digital de Documentos
   - 8.6 Consultar Expedientes
9. [ESTADOS DEL EXPEDIENTE](#9-estados-del-expediente)
10. [FLUJO COMPLETO DE UN TRÁMITE](#10-flujo-completo-de-un-trámite)
11. [SALIR DEL SISTEMA](#11-salir-del-sistema)

---

## 1. INTRODUCCIÓN

El presente manual de usuario tiene como objetivo brindar una guía clara, ordenada y accesible para el uso del **Sistema SIGEDEX – Sistema de Gestión de Expedientes Digitales**. Este sistema fue desarrollado con el fin de digitalizar y optimizar los procesos administrativos de gestión de expedientes, permitiendo llevar un control preciso del ciclo de vida de cada trámite desde su presentación hasta su resolución final.

A través de este manual, el usuario podrá comprender el funcionamiento de cada módulo, identificar las acciones disponibles según su rol y realizar todas las operaciones necesarias de manera segura y eficiente.

### 1.1 Propósito del Manual

El propósito de este manual es:

- Explicar detalladamente cómo navegar y utilizar cada sección del sistema según el rol asignado.
- Ofrecer instrucciones paso a paso para la presentación de trámites, asignación de expedientes, evaluaciones técnicas y jurídicas, y toma de decisiones.
- Facilitar el aprendizaje de nuevos usuarios y servir como material de consulta para resolver dudas operativas.
- Garantizar que el uso del sistema se realice siguiendo las buenas prácticas y los procedimientos internos establecidos.

Este documento actúa como guía oficial de uso del sistema para todo el personal autorizado.

### 1.2 Audiencia

Este manual está dirigido a los cinco tipos de usuarios del sistema:

- **Presentante / Ciudadano:** Persona que inicia un trámite, adjunta documentación, realiza el pago y hace seguimiento del estado de su expediente.
- **Administrativo:** Encargado de gestionar los expedientes, asignarlos a los técnicos correspondientes, y administrar usuarios, roles, departamentos y tipos de trámite.
- **Técnico:** Profesional que recepciona los expedientes asignados, realiza la evaluación técnica y los deriva al área jurídica.
- **Jurídico:** Profesional que recepciona los expedientes derivados por el técnico, realiza la evaluación legal y los eleva a la Dirección.
- **Director:** Máxima autoridad del sistema. Recepciona los expedientes evaluados, revisa toda la información y toma la decisión final de aprobación o rechazo.

No se requieren conocimientos técnicos previos para utilizar el sistema. Las instrucciones están diseñadas para usuarios con distintos niveles de experiencia.

---

## 2. REQUISITOS PARA ACCEDER AL SISTEMA

Antes de ingresar al sistema, el usuario debe cumplir con los siguientes requisitos:

- Poseer un **usuario y contraseña** asignados (o registrarse como Presentante).
- Contar con **conexión a Internet**.
- Tener acceso a un **dispositivo compatible** (PC, Notebook o Tablet) con:
  - Navegador actualizado (Google Chrome recomendado).
  - Resolución mínima estandarizada para una correcta visualización de los paneles.
- Haber iniciado sesión en un **entorno seguro** para evitar el acceso de terceros.

### 2.1 Acceso al Sistema

Para acceder al sistema, el usuario debe ingresar a la dirección web correspondiente al servidor donde se encuentra alojada la aplicación.

Una vez en la página principal, se mostrará la pantalla de inicio de sesión del sistema SIGEDEX.

---

## 3. PANTALLA DE INICIO DE SESIÓN / LOGIN

> **[CAPTURA: Pantalla de Login]**

### 3.1 Descripción General

La pantalla de **INICIO DE SESIÓN** permite al usuario autenticarse en el sistema mediante el ingreso de sus credenciales personales. Esta funcionalidad garantiza que únicamente usuarios registrados y autorizados puedan acceder a las distintas secciones del sistema, asegurando la confidencialidad e integridad de la información.

El acceso está protegido mediante un mecanismo de autenticación basado en credenciales (nombre de usuario y contraseña).

### 3.2 Elementos de la Interfaz

La pantalla está compuesta por los siguientes componentes:

- **Campo "Usuario":** Permite ingresar el nombre de usuario o email registrado en el sistema. Es obligatorio.
- **Campo "Contraseña":** Permite ingresar la contraseña asociada al usuario. Incluye opción de visualización para mostrar u ocultar el contenido.
- **Botón "Ingresar":** Ejecuta el proceso de validación de credenciales. Si los datos son correctos, el sistema redirige al panel principal según el rol asignado.
- **Enlace "¿Olvidaste tu contraseña?":** Permite iniciar el proceso de recuperación de contraseña.
- **Botón "Registrarse":** Solo disponible para Presentantes. Redirige al formulario de registro de nuevos usuarios.

### 3.3 Procedimiento de Inicio de Sesión

Para acceder al sistema, el usuario debe:

1. Ingresar su nombre de usuario o email en el campo correspondiente.
2. Ingresar su contraseña.
3. Presionar el botón **"Ingresar"**.
4. Esperar la validación automática del sistema.

Si las credenciales son válidas, el sistema habilitará el acceso al panel principal correspondiente al rol del usuario.

#### 3.3.1 Validaciones y Mensajes

El sistema realiza las siguientes validaciones:

- Verificación de campos obligatorios.
- Confirmación de existencia del usuario.
- Verificación de coincidencia de contraseña.

En caso de error, se mostrará un mensaje informativo indicando la causa: **"Usuario o contraseña incorrectos"**.

### 3.4 Registro de Usuario (Presentante)

> **[CAPTURA: Formulario de Registro]**

#### 3.4.1 Descripción General

La pantalla de **REGISTRO** permite a los ciudadanos crear una cuenta para poder presentar trámites en el sistema. Esta funcionalidad está disponible únicamente para el rol **Presentante**. Los demás roles (Administrativo, Técnico, Jurídico, Director) son creados por el Administrativo desde el panel de gestión de usuarios.

#### 3.4.2 Elementos de la Interfaz

El formulario de registro contiene los siguientes campos:

- **Nombre** (obligatorio)
- **Apellido** (obligatorio)
- **DNI** (obligatorio)
- **Email** (obligatorio, debe ser único en el sistema)
- **Teléfono** (obligatorio)
- **Dirección** (obligatorio)
- **Nombre de usuario** (obligatorio, debe ser único)
- **Contraseña** (obligatorio, mínimo 6 caracteres)
- **Confirmar contraseña** (obligatorio)
- **Botón "Registrarse":** Ejecuta la validación y almacenamiento de los datos.

#### 3.4.3 Procedimiento de Registro

Para crear una nueva cuenta, el usuario debe:

1. Completar todos los campos obligatorios del formulario.
2. Asegurarse de que las contraseñas coincidan.
3. Presionar el botón **"Registrarse"**.

Si los datos son válidos, el sistema registrará al usuario y mostrará una notificación de **REGISTRO EXITOSO**, permitiendo acceder al sistema de inmediato.

### 3.5 Recuperar Contraseña

> **[CAPTURA: Modal Recuperar Contraseña]**

En caso de no recordar la contraseña, hacer clic en **"¿Olvidaste tu contraseña?"**.

El sistema mostrará un formulario donde:

1. Ingresar el **email registrado** y presionar **"Enviar código"**.
2. Revisar el correo personal: llegará un **código de recuperación** de 6 dígitos.
3. Ingresar el código en el campo correspondiente.
4. Ingresar la **nueva contraseña**.
5. Presionar **"Guardar"**.

Si el proceso es exitoso, el sistema mostrará una confirmación y el usuario podrá iniciar sesión con la nueva contraseña.

---

## 4. MÓDULO DEL PRESENTANTE

### 4.1 Descripción General

El módulo del **Presentante** permite a los ciudadanos iniciar trámites administrativos, adjuntar la documentación requerida, realizar el pago del arancel correspondiente y hacer seguimiento del estado de sus expedientes en tiempo real.

> **[CAPTURA: Panel principal del Presentante]**

Desde esta sección el usuario puede:

- Crear un nuevo trámite.
- Ver el estado actualizado de todos sus expedientes.
- Acceder al historial de acciones de cada expediente.
- Ver las observaciones realizadas por los distintos actores del proceso.
- Descargar documentación asociada al expediente.
- Editar su perfil de usuario.

### 4.2 Crear Nuevo Trámite

El proceso de creación de un nuevo trámite se realiza en **3 pasos**.

#### 4.2.1 Paso 1 – Datos del Trámite

> **[CAPTURA: Formulario Paso 1]**

Al hacer clic en **"Nuevo Trámite"**, el sistema muestra el primer formulario con los siguientes campos:

**Datos del trámite (completar):**
- **Tipo de expediente** (obligatorio, dropdown):
  - Línea de Ribera
  - Constancia de PMRCI
- **Ubicación del proyecto** (obligatorio): dirección completa donde se realizará la obra o intervención.
- **Descripción del trámite** (obligatorio): descripción detallada de lo que se solicita.

**Datos del presentante (precargados, no editables):**
- Nombre y Apellido
- DNI
- Email
- Dirección
- Teléfono

Una vez completados los campos, presionar **"Continuar"** para pasar al Paso 2.

#### 4.2.2 Paso 2 – Adjuntar Documentación

> **[CAPTURA: Formulario Paso 2 – Adjuntar documentos]**

Este paso permite adjuntar los documentos requeridos para el trámite seleccionado.

**Documentos generalmente requeridos:**
- DNI del presentante
- Plano de ubicación del proyecto
- Memoria descriptiva
- Título de propiedad o boleto de compra-venta

**Especificaciones técnicas:**
- Formatos aceptados: PDF, JPG, JPEG, PNG, DOC, DOCX
- Tamaño máximo por archivo: 5 MB

**Procedimiento:**
1. Hacer clic en **"Seleccionar archivos"** o arrastrar los archivos al área indicada.
2. Verificar que los archivos aparezcan en la lista de adjuntos.
3. Para eliminar un archivo antes de continuar, hacer clic en el ícono de eliminación.
4. Presionar **"Continuar"** para avanzar al Paso 3.

#### 4.2.3 Paso 3 – Realizar Pago

> **[CAPTURA: Formulario Paso 3 – Pago]**

El último paso consiste en abonar el arancel correspondiente al tipo de trámite seleccionado.

**Información mostrada:**
- Resumen del expediente (tipo, descripción, ubicación)
- Monto a pagar según tipo de trámite

**Integración con Mercado Pago:**

El sistema redirige al portal de Mercado Pago donde el usuario puede pagar con:
- Tarjeta de débito o crédito
- Dinero en cuenta de Mercado Pago
- Otros medios disponibles en la plataforma

**Resultado exitoso:**

Al confirmarse el pago, el sistema:
- Genera automáticamente el número de expediente (Ej: **2026/0001**)
- Crea el expediente con estado inicial: **"Pendiente"**
- Muestra confirmación al presentante

### 4.3 Consultar Estado de Expedientes

> **[CAPTURA: Tabla de consulta de expedientes del Presentante]**

#### 4.3.1 Descripción General

La sección de consulta muestra todos los expedientes presentados por el usuario, con su estado actualizado en tiempo real.

**Información en Tabla:**

| Columna | Descripción |
|---|---|
| N° Expediente | Identificador único del trámite |
| Tipo | Tipo de expediente seleccionado |
| Estado | Estado actual con color distintivo |
| Prioridad | Nivel de prioridad asignado |
| Asignado a | Usuario responsable actual |
| Fecha de creación | Fecha y hora de presentación |
| Acciones | Ver detalles del expediente |

#### 4.3.2 Filtros Disponibles

La sección cuenta con los siguientes filtros para facilitar la búsqueda:

- **Búsqueda por número:** campo de texto para buscar por número de expediente, estado o usuario.
- **Filtro por estado** (dropdown): Pendiente, En revisión, Aprobado, Rechazado, Archivado, entre otros.
- **Filtro por tipo de expediente** (dropdown): según los tipos disponibles.
- **Filtro por prioridad** (dropdown).
- **Filtro por asignado a** (dropdown): usuario responsable actual.
- **Filtro por rango de fechas** (botón "Filtrar por fecha"): abre un selector con campos "Fecha de inicio" y "Hasta", con botones "Limpiar" y "Aplicar".

La tabla muestra **10 expedientes por página**, con controles de paginación.

#### 4.3.3 Ver Detalles del Expediente

Al hacer clic en **"Ver detalles"**, se abre un modal con las siguientes pestañas:

**Pestaña "Información":**

> **[CAPTURA: Pestaña Información]**

- Número de expediente
- Tipo y estado actual
- Datos del presentante
- Descripción completa
- Ubicación del proyecto
- Fecha de creación y prioridad

**Pestaña "Documentos":**

> **[CAPTURA: Pestaña Documentos]**

- Lista de todos los documentos adjuntos al expediente
- Para cada archivo: nombre, quién lo subió, su rol y la fecha de carga
- Botón para **descargar** cada documento
- Botón para **visualizar** documentos directamente en el navegador

**Pestaña "Historial":**

> **[CAPTURA: Pestaña Historial]**

- Cronología completa de todas las acciones realizadas sobre el expediente
- Para cada acción: fecha y hora, usuario responsable, acción realizada y comentarios
- Ordenado del más reciente al más antiguo

**Pestaña "Observaciones":**

> **[CAPTURA: Pestaña Observaciones]**

Muestra las observaciones registradas por cada área en orden cronológico:
- Observaciones del Administrativo
- Observaciones del Técnico
- Observaciones del Jurídico
- Observaciones del Director

### 4.4 Editar Perfil de Usuario

> **[CAPTURA: Modal de Perfil]**

Haciendo clic en el nombre o ícono de usuario se accede al perfil personal.

**Campos editables:**
- Nombre y Apellido
- Email
- Teléfono
- Dirección
- Nombre de usuario
- Contraseña (opcional, solo completar si se desea cambiar)

**Procedimiento:**
1. Hacer clic en **"Editar"** para habilitar los campos.
2. Realizar los cambios deseados.
3. Presionar **"Guardar"** para confirmar, o **"Cancelar"** para descartar.

El sistema mostrará un mensaje de confirmación al guardar exitosamente.

---

## 5. MÓDULO DEL ADMINISTRATIVO

### 5.1 Descripción General

El módulo del **Administrativo** es el centro de gestión del sistema. Desde aquí se controlan los expedientes en proceso, se asignan a los técnicos correspondientes, y se administran todos los elementos configurables del sistema.

> **[CAPTURA: Panel principal del Administrativo]**

El panel principal presenta accesos directos a:
1. Consultar y Asignar Expedientes
2. Gestión de Usuarios
3. Gestión de Departamentos
4. Gestión de Roles y Permisos
5. Gestión de Firmas Digitales
6. Gestión de Tipos de Trámite

### 5.2 Expedientes en Revisión

> **[CAPTURA: Tabla Expedientes en Revisión]**

#### 5.2.1 Descripción General

Esta sección es la principal herramienta operativa del Administrativo. Permite visualizar todos los expedientes activos, asignarlos a los técnicos y exportar reportes.

#### 5.2.2 Información en Tabla

| Columna | Descripción |
|---|---|
| N° Expediente | Identificador único |
| Tipo | Tipo de trámite |
| Estado | Estado actual con badge de color |
| Presentante | Nombre del ciudadano |
| Fecha de Creación | Fecha de presentación |
| Asignado a | Técnico o usuario responsable actual |
| Departamento | Área responsable |
| Acciones | Ver, Asignar / Pase |

#### 5.2.3 Filtros Disponibles

- Búsqueda por número de expediente o nombre del presentante
- Filtro por estado (valor predeterminado: "En revisión")
- Filtro por tipo de trámite
- Filtro por rango de fechas (botón "Filtrar por fecha": "Fecha de inicio" y "Hasta")

#### 5.2.4 Realizar Pase (Asignación a Técnico)

> **[CAPTURA: Modal Realizar Pase]**

Para asignar un expediente a un técnico:

1. Hacer clic en el botón de acción del expediente.
2. En el modal **"Realizar Pase"** completar:
   - **Técnico destino** (dropdown con usuarios técnicos disponibles)
   - **Observaciones** (campo de texto, opcional)
   - **Documentos adicionales** (opcional)
3. Presionar **"Confirmar Pase"**.

Al confirmar:
- El estado del expediente cambia a **"En revisión técnica"**
- Se registra la acción en el historial
- Se envía una **notificación automática** al técnico asignado

#### 5.2.5 Exportar Reporte a PDF

Haciendo clic en **"Generar Reporte"**, el sistema genera un documento PDF con:
- Encabezado: "Expedientes en Revisión – Administración"
- Fecha y hora de generación
- Tabla con todos los expedientes visibles (según filtros activos)

### 5.3 Gestión de Usuarios

> **[CAPTURA: Lista de Usuarios]**

#### 5.3.1 Crear Usuario

El Administrativo puede crear cuentas para todos los roles del sistema (excepto Presentante, que se registra de forma autónoma).

**Campos del formulario:**
- Nombre y Apellido (obligatorio)
- DNI (obligatorio)
- Email (obligatorio)
- Teléfono
- Dirección
- Nombre de usuario (obligatorio)
- Contraseña (obligatorio, mínimo 6 caracteres)
- **Tipo de usuario** (dropdown): Administrativo, Técnico, Jurídico, Director
- **Rol asignado** (dropdown con roles disponibles)

Presionar **"Crear Usuario"** para confirmar.

#### 5.3.2 Listar y Editar Usuarios

La lista muestra todos los usuarios registrados con:
- Nombre y Apellido, DNI, Email
- Tipo de usuario y Rol asignado
- Acciones: **Editar** / **Eliminar**

Al hacer clic en **"Editar"** se puede modificar cualquier dato del usuario, incluyendo cambio de tipo, rol o contraseña.

### 5.4 Gestión de Departamentos

> **[CAPTURA: Crear / Listar Departamentos]**

Permite organizar los equipos de trabajo en departamentos.

**Crear Departamento:**
- Nombre del departamento (obligatorio)
- Descripción (opcional)
- Usuario responsable (dropdown)
- Presionar **"Guardar"**

**Listar Departamentos:**
Muestra tabla con nombre, descripción, usuario responsable y acciones (Editar / Eliminar).

### 5.5 Gestión de Roles y Permisos

> **[CAPTURA: Crear Rol con Permisos]**

#### 5.5.1 Roles

Los roles definen qué acciones puede realizar cada usuario dentro del sistema.

**Crear Rol:**
- Nombre del rol (obligatorio)
- Descripción (opcional)
- **Seleccionar permisos** (checkboxes): Consultar expedientes, Recepción de pases, Realizar pases, Aprobar / Rechazar expedientes, Firmar documentos, Ver reportes, entre otros.
- Presionar **"Guardar Rol"**

**Listar Roles:** Tabla con nombre, descripción, permisos asignados y acciones (Editar / Eliminar).

#### 5.5.2 Permisos

Los permisos son las unidades mínimas de acción que se agrupan en roles.

**Crear Permiso:**
- Nombre (obligatorio)
- Descripción (obligatorio)
- Presionar **"Guardar"**

**Listar Permisos:** Tabla con nombre, descripción y acciones (Editar / Eliminar).

### 5.6 Gestión de Firmas Digitales

> **[CAPTURA: Crear / Listar Firmas Digitales]**

Permite registrar los certificados de firma digital que utilizará el Director para validar resoluciones.

**Crear Firma:**
- Número de certificado (obligatorio)
- Nombre del certificado (obligatorio)
- Usuario asociado (dropdown, generalmente el Director)
- Fecha de vencimiento
- Descripción (opcional)
- Presionar **"Guardar"**

**Listar Firmas:** Muestra número de certificado, usuario asociado, fecha de vencimiento, estado (Activa / Vencida) y acciones (Ver / Eliminar).

### 5.7 Gestión de Tipos de Trámite

> **[CAPTURA: Gestión de Tipos de Trámite]**

Define los tipos de expedientes disponibles para presentar en el sistema.

**Crear Tipo de Trámite:**
- Nombre (Ej: "Línea de Ribera") (obligatorio)
- Descripción
- Costo / Arancel (campo numérico)
- Documentos requeridos (lista de campos)
- Presionar **"Guardar"**

**Listar Tipos:** Tabla con nombre, descripción, costo y acciones (Editar / Eliminar).

---

## 6. MÓDULO DEL TÉCNICO

### 6.1 Descripción General

El módulo del **Técnico** permite recibir expedientes asignados por el Administrativo, realizar la evaluación técnica correspondiente y derivarlos al área jurídica una vez concluida la revisión.

> **[CAPTURA: Panel principal del Técnico]**

El panel técnico presenta las siguientes secciones principales:
1. **Bandeja** (inicio con expedientes asignados)
2. **Realizar Pase**
3. **Consulta de Expedientes**

### 6.2 Bandeja de Recepción

> **[CAPTURA: Bandeja del Técnico]**

#### 6.2.1 Descripción General

La bandeja muestra todos los expedientes que fueron asignados a este técnico. Cada expediente indica si ya fue recepcionado o si está pendiente.

**Estados de recepción en la bandeja:**
- **"Nuevo"** (sin recepcionar): el técnico aún no ha tomado formalmente el expediente.
- **"Recepcionado"** ✅: el técnico ya confirmó la recepción y puede realizar pases.

#### 6.2.2 Proceso de Recepción

> **[CAPTURA: Modal Recepcionar Expedientes]**

Para recepcionar uno o varios expedientes:

1. Seleccionar los expedientes mediante los **checkboxes** de la tabla.
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. En el modal, agregar **observaciones técnicas** (obligatorio).
4. Presionar **"Confirmar Recepción"**.

**Resultado:**
- Los expedientes seleccionados se marcan como ✅ "Recepcionado"
- Se registra la acción en el historial
- El técnico queda habilitado para realizar el pase

> **Importante:** Cada expediente solo puede recepcionarse **una vez** por técnico. Un expediente recepcionado por otro técnico no puede ser pasado por este.

#### 6.2.3 Ver Detalles desde la Bandeja

Al hacer clic en un expediente, se abre el modal de revisión con las siguientes pestañas:

- **Información:** datos generales del expediente
- **Documentos:** archivos adjuntos con opción de descarga y visualización en línea
- **Historial:** cronología completa de acciones
- **Observaciones:** observaciones de todos los roles involucrados
- **Subir documentación:** permite agregar archivos técnicos adicionales

**Subir documentación técnica:**

> **[CAPTURA: Pestaña Subir Documentación]**

1. Hacer clic en **"Seleccionar archivos"**.
2. Agregar un comentario descriptivo del documento.
3. Presionar **"Subir Documentos"**.

Los documentos quedan adjuntos al expediente y visibles para todos los actores del proceso.

**Agregar observaciones técnicas:**

Desde el modal se puede agregar una observación al expediente:
1. Escribir la observación en el campo correspondiente.
2. Presionar **"Guardar Observación"**.

Las observaciones quedan registradas con fecha, hora y usuario.

### 6.3 Realizar Pase

> **[CAPTURA: Modal Realizar Pase – Técnico]**

#### 6.3.1 Descripción General

Una vez completada la evaluación técnica, el técnico debe derivar el expediente al área Jurídica.

**Condición para hacer pase:** El expediente debe estar marcado como ✅ "Recepcionado" por este técnico. Si aparece 🔒 "Sin permiso de pase", otro técnico ya lo recepcionó.

#### 6.3.2 Procedimiento

1. Hacer clic en el botón **"Realizar Pase"** del expediente.
2. En el modal completar:
   - **Destinatario** (dropdown con usuarios Jurídicos disponibles)
   - **Observaciones del pase** (campo de texto)
   - **Documentos adicionales** (opcional, Ej: informes técnicos)
3. Presionar **"Confirmar Pase"**.

**Resultado:**
- El estado del expediente cambia a **"En revisión jurídica"**
- Se registra el pase en el historial
- Se envía una **notificación automática** al usuario jurídico seleccionado

### 6.4 Consultar Expedientes

> **[CAPTURA: Sección Consulta del Técnico]**

Permite buscar y visualizar expedientes del sistema independientemente de si están asignados a este técnico.

**Filtros disponibles:**
- Búsqueda por número, estado o usuario (campo de texto)
- Filtro por estado (predeterminado: "En revisión")
- Filtro por rango de fechas (botón "Filtrar por fecha")

**Vista en tabla:** N° Expediente, Presentante, Tipo, Descripción, Prioridad, Ubicación, Estado, Asignado a.

La tabla muestra **6 expedientes por página** con paginación y contador de resultados.

### 6.5 Deshacer Pase

En caso de haber realizado un pase por error, es posible revertirlo **siempre que el usuario jurídico destinatario aún no haya recepcionado el expediente**.

**Procedimiento:**
1. Identificar el expediente en la bandeja.
2. Hacer clic en **"Deshacer Pase"**.
3. Confirmar la acción.

El expediente vuelve a la bandeja del técnico con su estado anterior.

---

## 7. MÓDULO DEL JURÍDICO

### 7.1 Descripción General

El módulo del **Jurídico** permite recibir los expedientes derivados por el área técnica, realizar la evaluación legal correspondiente y elevarlos a la Dirección para su resolución final.

> **[CAPTURA: Panel principal del Jurídico]**

El funcionamiento es similar al del Técnico, con la diferencia de que el enfoque está en el análisis legal y el destinatario del pase es el Director.

Secciones del panel:
1. **Bandeja** (inicio con expedientes asignados)
2. **Realizar Pase**
3. **Consulta de Expedientes**

### 7.2 Bandeja de Recepción

> **[CAPTURA: Bandeja del Jurídico]**

Los expedientes que llegaron del área técnica aparecen en la bandeja con estado **"Nuevo"** o **"Recepcionado"**.

#### 7.2.1 Proceso de Recepción

1. Seleccionar los expedientes (checkboxes).
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. Agregar **observaciones jurídicas** en el modal (obligatorio).
4. Presionar **"Confirmar Recepción"**.

Los expedientes se marcan como ✅ "Recepcionado" y quedan habilitados para el pase.

#### 7.2.2 Revisión del Expediente

Desde el modal de revisión el jurídico puede:
- Ver todos los documentos adjuntos (incluido el informe técnico)
- Revisar el historial completo del expediente
- Ver las observaciones técnicas previas
- Subir documentación legal adicional (dictámenes, resoluciones de referencia)
- Agregar **observaciones jurídicas** al expediente

**Agregar observación jurídica:**
1. Escribir el análisis o comentario en el campo de observaciones.
2. Presionar **"Guardar Observación"**.

### 7.3 Realizar Pase al Director

> **[CAPTURA: Modal Realizar Pase – Jurídico]**

Una vez concluida la evaluación legal, el jurídico eleva el expediente al Director.

**Procedimiento:**
1. Hacer clic en **"Realizar Pase"** del expediente.
2. En el modal completar:
   - **Director destinatario** (dropdown con usuarios Director disponibles)
   - **Observaciones del pase** (análisis jurídico resumido)
   - **Documentos adicionales** (opcional, Ej: dictamen legal, opinión jurídica)
3. Presionar **"Confirmar Pase"**.

**Resultado:**
- Estado del expediente cambia a **"Pendiente de aprobación"**
- Se registra en el historial
- Notificación automática enviada al Director

### 7.4 Consultar Expedientes

Idéntica funcionalidad a la del Técnico (ver sección 6.4). Permite buscar expedientes con filtros por estado, fechas y texto.

---

## 8. MÓDULO DEL DIRECTOR

### 8.1 Descripción General

El módulo del **Director** es la última etapa del proceso. Aquí se reciben los expedientes evaluados por técnicos y jurídicos, se revisa toda la información acumulada y se toma la **decisión final**: aprobación o rechazo del trámite.

> **[CAPTURA: Panel principal del Director]**

El Director **NO realiza pases** a otros usuarios. Su función es la resolución definitiva.

Secciones disponibles:
1. **Bandeja**
2. **Consulta de Expedientes**

### 8.2 Bandeja y Recepción de Expedientes

> **[CAPTURA: Bandeja del Director]**

La bandeja muestra los expedientes elevados por el área jurídica, con indicadores de recepción.

**Recepcionar expedientes:**
1. Marcar los expedientes mediante **checkboxes**.
2. Hacer clic en **"Recepcionar Seleccionados"**.
3. En el modal, agregar observaciones (campo de texto).
4. Presionar **"Confirmar Recepción"**.

Los expedientes recepcionados quedan disponibles para revisión y resolución.

### 8.3 Revisión del Expediente

> **[CAPTURA: Modal de Revisión del Director]**

Al hacer clic en un expediente de la bandeja se abre el modal de revisión completa con las siguientes pestañas:

**Pestaña "Información del Expediente":**

> **[CAPTURA: Pestaña Información – Director]**

- Número de expediente, tipo de trámite y estado actual
- Datos completos del presentante (Nombre, Apellido, DNI, Email)
- Descripción completa del proyecto, ubicación y prioridad

**Pestaña "Documentos":**

> **[CAPTURA: Pestaña Documentos – Director]**

- Lista completa de todos los documentos adjuntos (incluidos los agregados por técnicos y jurídicos)
- Para cada documento: nombre, quién lo subió, su rol y la fecha de carga
- Botón **Descargar** y botón **Ver** para cada archivo

**Pestaña "Historial":**

> **[CAPTURA: Pestaña Historial – Director]**

- Cronología completa desde la creación del expediente hasta la fecha
- Para cada registro: fecha/hora, usuario responsable, acción realizada, comentarios
- Ordenado del más reciente al más antiguo

**Pestaña "Observaciones":**

> **[CAPTURA: Pestaña Observaciones – Director]**

Vista consolidada de todas las observaciones registradas:
- Observaciones del Administrativo
- Observaciones del Técnico
- Observaciones del Jurídico
- Observaciones del Director (las propias)

**Pestaña "Subir Documentación":**

Permite adjuntar documentos adicionales (resoluciones, actos administrativos, etc.):
1. Seleccionar archivos.
2. Ingresar un comentario descriptivo.
3. Presionar **"Subir Documentos"**.

### 8.4 Tomar Decisión Final

> **[CAPTURA: Modal Decisión Final]**

Esta es la acción central del rol Director. Desde el modal de revisión hacer clic en **"Revisar / Tomar Decisión"**.

**Elementos del formulario de decisión:**

- **Seleccionar decisión** (obligatorio):
  - ⭕ **Aprobar** – el expediente cumple todos los requisitos
  - ⭕ **Rechazar** – el expediente no cumple los requisitos

- **Comentario / Justificación** (campo de texto, OBLIGATORIO):
  - Explicación detallada de la decisión
  - Fundamento técnico, legal y/o administrativo

- **Botón "Confirmar Decisión"** (solo se habilita cuando se selecciona una opción y se escribe el comentario)

**Resultado si APROBADO:**

> **[CAPTURA: Notificación de Aprobación]**

- Estado del expediente cambia a: **"APROBADO"** (verde ✅)
- Se registra la decisión en el historial con fecha, hora y usuario
- Se envía una **notificación automática al presentante** informando la aprobación

**Resultado si RECHAZADO:**

> **[CAPTURA: Notificación de Rechazo]**

- Estado del expediente cambia a: **"RECHAZADO"** (rojo ❌)
- Se registra la decisión en el historial con el motivo de rechazo
- Se envía una **notificación automática al presentante** con el motivo del rechazo

### 8.5 Firma Digital de Documentos

> **[CAPTURA: Modal Firma Digital]**

El Director puede firmar digitalmente documentos adjuntos al expediente para darles validez legal (resoluciones, actos administrativos).

#### 8.5.1 Procedimiento de Firma

1. Desde el modal del expediente, seleccionar el documento a firmar.
2. Hacer clic en **"Firmar Documento"**.
3. En el modal de firma:
   - Seleccionar la **firma digital** a utilizar (dropdown con firmas activas del Director).
   - El sistema muestra los datos de la firma: número de certificado, fecha de vencimiento y estado.

4. **Proceso OTP (One Time Password):**
   - Hacer clic en **"Iniciar OTP"**: el sistema genera y envía un código de 6 dígitos al email del Director.
   - Ingresar el **código OTP** recibido en el campo correspondiente.
   - Hacer clic en **"Validar OTP"**.

5. Una vez validado, presionar **"Confirmar Firma"**.

**Resultado:**
- El documento queda firmado digitalmente con validez legal.
- Se registra el timestamp de la firma y el hash de integridad del documento.
- El historial del expediente refleja la acción de firma.

> **Nota:** No es posible firmar con una firma cuya fecha de vencimiento haya expirado. El sistema mostrará el estado "Vencida" e impedirá continuar.

### 8.6 Consultar Expedientes

> **[CAPTURA: Sección Consulta del Director]**

La sección de consulta del Director permite buscar cualquier expediente del sistema.

**Filtros disponibles:**
- Búsqueda por número, estado o usuario (campo de texto)
- **Filtro por estado** (dropdown, predeterminado: "En revisión"):
  - En revisión / Aprobado / Rechazado / Pendiente / Archivado
- **Filtro por rango de fechas** (botón "Filtrar por fecha")

**Vista en tabla:** N° Expediente, Presentante, Tipo, Descripción, Prioridad, Ubicación, Estado, Asignado a.

Paginación de 6 expedientes por página con contador de resultados totales.

---

## 9. ESTADOS DEL EXPEDIENTE

A lo largo de su ciclo de vida, un expediente puede encontrarse en los siguientes estados:

| Estado | Color | Descripción | Rol Responsable |
|---|---|---|---|
| **Pendiente** | Amarillo 🟡 | Creado y pagado, esperando asignación administrativa | Administrativo |
| **En revisión** | Azul 🔵 | Asignado y en proceso activo | Técnico |
| **En revisión técnica** | Naranja 🟠 | En evaluación por el área técnica | Técnico |
| **En revisión jurídica** | Violeta 🟣 | En evaluación por el área jurídica | Jurídico |
| **Pendiente de aprobación** | Oscuro ⚫ | Esperando decisión final del Director | Director |
| **Aprobado** | Verde ✅ | Trámite aprobado exitosamente | – |
| **Rechazado** | Rojo ❌ | Trámite rechazado por no cumplir requisitos | – |
| **Archivado** | Gris ⚪ | Expediente archivado por el Administrativo | Administrativo |

---

## 10. FLUJO COMPLETO DE UN TRÁMITE

El siguiente diagrama describe el recorrido completo de un expediente a través del sistema:

### Fase 1 – PRESENTANTE

1. El ciudadano inicia sesión (o se registra).
2. Crea un nuevo trámite: completa los datos, adjunta la documentación requerida y realiza el pago mediante Mercado Pago.
3. El sistema genera el número de expediente automáticamente.
4. **Estado resultante: "Pendiente"**

### Fase 2 – ADMINISTRATIVO

1. El Administrativo visualiza el expediente en **"Expedientes en Revisión"**.
2. Verifica la documentación presentada.
3. Realiza el **pase al Técnico** correspondiente.
4. **Estado resultante: "En revisión técnica"**

### Fase 3 – TÉCNICO

1. El Técnico visualiza el expediente en su **bandeja** (estado: "Nuevo").
2. **Recepciona** el expediente agregando observaciones técnicas.
3. Revisa toda la documentación y evalúa el cumplimiento técnico.
4. Puede subir informes y documentación adicional.
5. Realiza el **pase al Jurídico** con su análisis técnico.
6. **Estado resultante: "En revisión jurídica"**

### Fase 4 – JURÍDICO

1. El Jurídico visualiza el expediente en su bandeja (estado: "Nuevo").
2. **Recepciona** el expediente agregando observaciones jurídicas.
3. Revisa la documentación y evalúa el marco normativo aplicable.
4. Puede subir dictámenes y documentación legal.
5. Realiza el **pase al Director** con su opinión jurídica.
6. **Estado resultante: "Pendiente de aprobación"**

### Fase 5 – DIRECTOR

1. El Director visualiza el expediente en su bandeja (estado: "Nuevo").
2. **Recepciona** el expediente.
3. Revisa toda la información acumulada: documentos, historial, observaciones técnicas y jurídicas.
4. Toma la **decisión final**:
   - Si **aprueba**: estado → **"Aprobado"** + notificación al presentante.
   - Si **rechaza**: estado → **"Rechazado"** + notificación al presentante con motivo.
5. Opcionalmente, firma digitalmente los documentos de resolución mediante OTP.

---

## 11. SALIR DEL SISTEMA

Al hacer clic en la opción **"Cerrar Sesión"** o **"Salir"**:

- Se cierra la sesión activa del usuario.
- El usuario es redirigido a la pantalla de inicio de sesión.
- Se finaliza el acceso al sistema de manera segura.

> **Recomendación:** Siempre cerrar sesión al terminar de trabajar, especialmente en dispositivos compartidos.

---

*Manual de Usuario SIGEDEX – Versión 1.0*
