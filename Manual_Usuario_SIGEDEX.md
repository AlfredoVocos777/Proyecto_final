# MANUAL DE USUARIO
## SIGEDEX - Sistema de Gestión de Expedientes Digitales

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Institución:** Universidad  
**Proyecto:** Sistema de Gestión de Expedientes Digitales

--- 

## ÍNDICE

1. [Introducción](#1-introducción)
2. [Instalación y Requisitos](#2-instalación-y-requisitos)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Funcionalidades por Tipo de Usuario](#4-funcionalidades-por-tipo-de-usuario)
   - 4.1 [Usuario Ciudadano](#41-usuario-ciudadano)
   - 4.2 [Usuario Administrativo](#42-usuario-administrativo)
   - 4.3 [Usuario Técnico](#43-usuario-técnico)
   - 4.4 [Usuario Jurídico](#44-usuario-jurídico)
   - 4.5 [Usuario Director](#45-usuario-director)
5. [Flujo Completo de un Expediente](#5-flujo-completo-de-un-expediente)
6. [Solución de Problemas Frecuentes](#6-solución-de-problemas-frecuentes)
7. [Glosario](#7-glosario)
8. [Contacto y Soporte](#8-contacto-y-soporte)

---

## 1. INTRODUCCIÓN

### ¿Qué es SIGEDEX?

SIGEDEX (Sistema de Gestión de Expedientes Digitales) es una plataforma web diseñada para digitalizar y gestionar el ciclo completo de expedientes administrativos, permitiendo:

- **Presentación digital** de trámites por parte de ciudadanos
- **Seguimiento en tiempo real** del estado de expedientes
- **Gestión eficiente** por parte de personal técnico, jurídico y directivo
- **Trazabilidad completa** mediante historial de acciones
- **Pagos digitales** integrados con Mercado Pago
- **Firmas digitales** para documentos oficiales

### Beneficios del Sistema

- ✅ Reducción de uso de papel
- ✅ Acceso 24/7 desde cualquier dispositivo
- ✅ Trazabilidad total de operaciones
- ✅ Agilización de tiempos de respuesta
- ✅ Mayor transparencia administrativa

---

## 2. INSTALACIÓN Y REQUISITOS

### 2.1 Requisitos del Usuario

Para utilizar SIGEDEX solo necesitas:

**Hardware:**
- Computadora, tablet o smartphone
- Conexión a internet estable (mínimo 2 Mbps)

**Software:**
- Navegador web actualizado:
  - Google Chrome (recomendado)
  - Mozilla Firefox
  - Microsoft Edge
  - Safari

**Otros:**
- Cuenta de correo electrónico válida
- Para pagos: tarjeta de débito/crédito o cuenta de Mercado Pago

### 2.2 Acceso a la Plataforma

No requiere instalación. Accede desde tu navegador a:

```
http://localhost:5173/
```

*(En producción se reemplazará por la URL oficial del organismo)*

---

## 3. ACCESO AL SISTEMA

### 3.1 Registro de Usuario Ciudadano

**Paso 1:** En la página principal, haz clic en **"Crear cuenta"**

**Paso 2:** Completa el formulario con:
- Nombre completo
- DNI
- Email
- Teléfono
- Dirección
- Nombre de usuario
- Contraseña (mínimo 6 caracteres)

**Paso 3:** Haz clic en **"Registrar"**

**Paso 4:** El sistema te confirmará la creación de la cuenta

### 3.2 Inicio de Sesión

**Paso 1:** Ingresa tu usuario y contraseña en la pantalla principal

**Paso 2:** Haz clic en **"Ingresar"**

**Paso 3:** Serás redirigido a tu portal según tu tipo de usuario:
- Ciudadano → Portada General
- Administrativo → Portada Administrativo
- Técnico → Portal Técnico
- Jurídico → Portal Jurídico
- Director → Portal Director

### 3.3 Recuperación de Contraseña

Si olvidaste tu contraseña:
1. Contacta al área administrativa
2. Proporciona tu DNI y email registrado
3. El administrador restablecerá tu contraseña

---

## 4. FUNCIONALIDADES POR TIPO DE USUARIO

### 4.1 Usuario Ciudadano

#### 4.1.1 Crear Nuevo Trámite

El proceso de creación de un trámite consta de **3 pasos**: Datos del Trámite, Documentación y Pago.

**Paso 1: Completar datos del trámite**

Desde la portada principal, haz clic en **"Nuevo Trámite"**. Se abrirá el formulario donde debes completar:

**Datos del Trámite:**
- **Tipo de Expediente:** Selecciona de la lista desplegable (campo obligatorio *)
  - Línea de Ribera
  - Constancia de PMRCI
- **Ubicación del Proyecto:** Ingresa la dirección o ubicación donde se realizará el proyecto (campo obligatorio *)
- **Descripción:** Explica brevemente tu solicitud y los detalles del expediente (campo obligatorio *)

**Datos del Usuario:**
Los siguientes campos aparecen **precargados** con la información de tu registro y no son editables:
- Nombre
- Apellido
- DNI
- Email
- Dirección
- Teléfono

Una vez completados los datos, haz clic en **"Siguiente"** para continuar al paso 2.

**Paso 2: Adjuntar documentación**

En esta pantalla subirás los archivos necesarios para tu expediente.

**📋 Documentos Requeridos:**
- DNI del presentante
- Plano de ubicación de proyecto
- Memoria descriptiva
- Título de propiedad o boleto de compra venta

**Cómo subir archivos:**
- Haz clic en **"Seleccionar archivos"** o arrastra archivos a la zona indicada
- **Formatos permitidos:** PDF, JPG, JPEG, PNG, DOC, DOCX
- **Tamaño máximo:** 5MB por archivo
- Puedes adjuntar **múltiples archivos**
- Verás una lista de los archivos agregados
- Puedes eliminar archivos antes de confirmar

**⚠️ Importante:** Asegúrate de adjuntar toda la documentación requerida para que tu expediente pueda ser procesado correctamente.

Una vez cargados todos los documentos, haz clic en **"Siguiente"** para continuar al pago.

**Paso 3: Realizar pago**

- Verás un resumen del expediente a crear
- El sistema mostrará el monto a pagar según el tipo de trámite
- Haz clic en **"Proceder al Pago"**
- Serás redirigido a **Mercado Pago**
- Completa el pago con:
  - Tarjeta de débito/crédito
  - Mercado Pago
  - Otros medios disponibles
- Al confirmar el pago exitoso, el expediente quedará **oficialmente creado**
- El sistema te mostrará el **número de expediente generado** (Ej: 2025-0001)

**Paso 4: Confirmación**

- Recibirás un mensaje de éxito
- Se generará automáticamente el número de expediente
- El estado inicial será: **"Pendiente"** (esperando asignación administrativa)
- Podrás consultar tu expediente desde el menú **"Consulta"**

**⚠️ IMPORTANTE:** 
- Guarda el **número de expediente** para futuras consultas
- Si el pago no se procesa correctamente, el expediente no se creará
- Puedes volver a intentar el proceso desde el inicio

#### 4.1.2 Consultar Estado de Expediente

**Opción 1: Desde el menú**
- Haz clic en **"Consulta"** en el menú superior
- Ingresa el número de expediente
- Haz clic en **"Buscar"**

**Opción 2: Desde "Mis Expedientes"**
- Verás la lista de todos tus expedientes creados
- Estados posibles:
  - 🟡 **Pendiente:** Creado y pagado, esperando asignación administrativa
  - 🔵 **En revisión técnica:** Área técnica evaluando aspectos técnicos
  - 🟣 **En revisión jurídica:** Área legal evaluando cumplimiento normativo
  - 🟠 **Pendiente de aprobación:** Director evaluando para decisión final
  -  **Aprobado:** Trámite finalizado exitosamente ✓
  - 🔴 **Rechazado:** No cumple requisitos o fue rechazado

**Información visible:**
- Número de expediente (Ej: 2025-0001)
- Tipo de expediente (Línea de Ribera, Constancia de PMRCI)
- Estado actual (con color distintivo)
- Fecha de presentación
- Ubicación del proyecto
- Historial completo de acciones y pases

---

### 4.2 Usuario Administrativo

El usuario administrativo tiene acceso completo para gestionar el sistema.

#### 4.2.1 Panel de Control

Al iniciar sesión, accedes a:
- **Consulta de Expedientes:** Ver y buscar cualquier expediente
- **Gestión de Usuarios:** Crear, modificar y asignar roles
- **Gestión de Departamentos:** Administrar áreas del organismo
- **Gestión de Roles y Permisos:** Configurar accesos
- **Gestión de Firmas Digitales:** Configurar certificados
- **Asignación de Expedientes:** Asignar a técnicos, jurídicos o director

#### 4.2.2 Consultar y Asignar Expedientes

**Paso 1:** Haz clic en **"Consulta de Expedientes"**

**Paso 2:** Busca por:
- Número de expediente
- Tipo de trámite
- Estado
- Rango de fechas

**Paso 3:** Selecciona un expediente y haz clic en **"Asignar"**

**Paso 4:** Selecciona:
- **Tipo de usuario:** Técnico, Jurídico o Director
- **Usuario específico:** Del desplegable

**Paso 5:** Agrega observaciones (opcional) y confirma

**Paso 6:** El usuario asignado recibirá el expediente en su bandeja

#### 4.2.3 Crear Departamentos

**Paso 1:** Menú → **"Crear Departamento"**

**Paso 2:** Completa:
- Nombre del departamento
- Descripción
- Usuario responsable (opcional)

**Paso 3:** Haz clic en **"Crear Departamento"**

#### 4.2.4 Gestionar Roles y Permisos

**Crear Rol:**
1. Menú → **"Crear Rol"**
2. Ingresa nombre del rol (ej: "Técnico Senior")
3. Selecciona permisos:
   - ☑️ Consultar expedientes
   - ☑️ Recepción de pases
   - ☑️ Realizar pases
   - ☑️ Aprobar/Rechazar
   - ☑️ Firmar documentos
   - ☑️ Ver reportes
4. Haz clic en **"Crear Rol"**

**Crear Permiso:**
1. Menú → **"Crear Permiso"**
2. Ingresa nombre y descripción
3. Confirma

---

### 4.3 Usuario Técnico

El área técnica evalúa aspectos técnicos del expediente (ej: planos, especificaciones).

#### 4.3.1 Panel Técnico

Al iniciar sesión verás:
- **Inicio:** Resumen de expedientes pendientes
- **Realizar Pase:** Expedientes que puedes derivar
- **Consultar Expediente:** Búsqueda general
- **Recepción:** Expedientes asignados a ti
- **Informes y Análisis:** Generar informes técnicos
- **Manual de Usuario**

#### 4.3.2 Recepcionar Expedientes

**Paso 1:** Haz clic en **"Recepción"**

**Paso 2:** Verás la lista de expedientes asignados a ti

**Paso 3:** Revisa cada expediente:
- Número
- Tipo de trámite
- Estado
- Fecha de asignación

**Paso 4:** Selecciona los expedientes que vas a recepcionar (✓ checkbox)

**Paso 5:** Haz clic en **"Recepcionar Seleccionados"**

**Paso 6:** Agrega observaciones técnicas (opcional)

**Paso 7:** Confirma la recepción

**✓ Importante:** Solo puedes recepcionar cada expediente UNA vez. Una vez recepcionado, aparecerá el badge **"✓ Recepcionado"**

#### 4.3.3 Realizar Pases

Solo puedes realizar pases de expedientes que **tú hayas recepcionado previamente**.

**Paso 1:** Menú → **"Realizar Pase"**

**Paso 2:** Verás solo los expedientes disponibles para pase (con permiso)

**Indicadores:**
- ✓ Recepcionado (badge verde) = Lo recepcionaste
- 🔒 Sin permiso de pase (badge amarillo) = Otro usuario lo recepcionó

**Paso 3:** Haz clic en **"➤ Realizar Pase"** en el expediente deseado

**Paso 4:** Selecciona:
- Departamento destino
- Usuario destino (técnico, jurídico o director)
- Observaciones del pase

**Paso 5:** Confirma el pase

**Paso 6:** El expediente saldrá de tu bandeja y llegará al destinatario

#### 4.3.4 Generar Informes Técnicos

**Paso 1:** Menú → **"Informes y Análisis"**

**Paso 2:** Selecciona tipo de informe:
- Informe de inspección
- Análisis de planos
- Evaluación técnica
- Otros

**Paso 3:** Completa el formulario con tus observaciones técnicas

**Paso 4:** Adjunta archivos complementarios (fotos, mediciones, etc.)

**Paso 5:** Guarda o genera PDF

---

### 4.4 Usuario Jurídico

El área jurídica evalúa aspectos legales del expediente.

#### 4.4.1 Panel Jurídico

Funcionalidades similares al técnico pero con enfoque legal:
- **Inicio:** Expedientes pendientes de revisión legal
- **Realizar Pase Legal:** Derivar expedientes
- **Consultar Expediente**
- **Recepción:** Recepcionar expedientes asignados
- **Opiniones Legales:** Emitir dictámenes
- **Manual de Usuario**

#### 4.4.2 Proceso de Recepción

Idéntico al Usuario Técnico (ver sección 4.3.2)

**Control de acceso:**
- Solo puedes recepcionar expedientes UNA vez
- Badge "✓ Recepcionado" indica que ya lo recepcionaste

#### 4.4.3 Realizar Pases Legales

Idéntico al Usuario Técnico (ver sección 4.3.3)

**Restricción:** Solo puedes hacer pases de expedientes que tú hayas recepcionado

#### 4.4.4 Emitir Opiniones Legales

**Paso 1:** Selecciona el expediente en revisión

**Paso 2:** Menú → **"Opiniones Legales"**

**Paso 3:** Redacta tu dictamen legal incluyendo:
- Análisis de normativa aplicable
- Cumplimiento de requisitos legales
- Recomendaciones
- Conclusión (Favorable / Desfavorable / Con observaciones)

**Paso 4:** Adjunta documentación legal de respaldo

**Paso 5:** Guarda o genera PDF del dictamen

---

### 4.5 Usuario Director

El Director es el **último eslabón del trámite** y tiene la autoridad final para aprobar o rechazar expedientes.

#### 4.5.1 Panel Director

Funcionalidades:
- **Inicio:** Expedientes para decisión final
- **Consultar Expediente**
- **Recepción:** Recepcionar expedientes asignados
- **Aprobar/Rechazar:** Tomar decisión final
- **Firmar Documentos:** Firma digital de resoluciones
- **Reportes y Estadísticas**
- **Supervisión de Áreas**

**⚠️ Nota importante:** El Director NO realiza pases porque es el final del flujo.

#### 4.5.2 Revisar Expedientes

**Paso 1:** En la sección **"Recepción"**, verás los expedientes asignados

**Paso 2:** Haz clic en **"📋 Revisar"** en el expediente deseado

**Paso 3:** Se abrirá el **Modal de Revisión Completa** con:

**Pestaña "Información del Expediente":**
- Número de expediente
- Tipo de trámite
- Estado actual
- Usuario presentante (ciudadano)
- Descripción completa
- Fechas importantes

**Pestaña "Documentos":**
- Lista de todos los documentos adjuntos
- Opción para descargar cada archivo
- Visualización de tipo y tamaño

**Pestaña "Historial":**
- Cronología completa de acciones
- Usuario responsable de cada acción
- Fechas y observaciones

#### 4.5.3 Adjuntar Documentación Adicional

Dentro del modal de revisión:

**Paso 1:** Ve a la pestaña **"Subir Documentos"**

**Paso 2:** Haz clic en **"Seleccionar archivos"**

**Paso 3:** Selecciona uno o varios archivos (resoluciones, dictámenes, etc.)

**Paso 4:** Agrega comentarios descriptivos

**Paso 5:** Haz clic en **"📤 Subir Documentos"**

**Paso 6:** Los documentos quedarán anexados al expediente

#### 4.5.4 Aprobar o Rechazar Expediente

Dentro del modal de revisión:

**Paso 1:** Ve a la pestaña **"Decisión"**

**Paso 2:** Selecciona una opción:
- ⚪ **Aprobar:** El expediente cumple todos los requisitos
- ⚪ **Rechazar:** El expediente no cumple requisitos

**Paso 3:** **Obligatorio:** Escribe un comentario explicando tu decisión

**Paso 4:** Haz clic en **"✓ Confirmar Decisión"**

**Paso 5:** El sistema:
- Actualizará el estado del expediente
- Registrará la acción en el historial
- Notificará al usuario presentante (TODO: implementar notificación)

**Resultado:**
- Si **APROBADO** → Estado: "Aprobado" (verde)
- Si **RECHAZADO** → Estado: "Rechazado" (rojo)

#### 4.5.5 Firmar Documentos Digitalmente

**Paso 1:** Menú → **"Firmar Documentos"**

**Paso 2:** Selecciona el documento a firmar

**Paso 3:** Elige tu firma digital configurada

**Paso 4:** Confirma la firma

**Paso 5:** El documento quedará firmado digitalmente con validez legal

---

## 5. FLUJO COMPLETO DE UN EXPEDIENTE

### Diagrama del Proceso

```
1. CIUDADANO
   ↓ [Crea trámite + Paga]
   
2. ADMINISTRATIVO
   ↓ [Asigna a Técnico]
   
3. TÉCNICO
   ↓ [Recepciona → Revisa → Pasa a Jurídico]
   
4. JURÍDICO
   ↓ [Recepciona → Revisa → Pasa a Director]
   
5. DIRECTOR
   ↓ [Recepciona → Revisa → Adjunta docs → APRUEBA/RECHAZA]
   
6. FINALIZADO
```

### Ejemplo Paso a Paso

**Escenario:** Juan Pérez solicita un expediente de Línea de Ribera

**Día 1 - 10:00hs:** Juan se registra en SIGEDEX y crea su trámite
- Completa formulario de Nuevo Trámite:
  - Tipo de Expediente: **Línea de Ribera**
  - Ubicación: "Av. Costanera 1234, Paraná"
  - Descripción: "Solicitud de línea de ribera para construcción de muelle privado"
- Adjunta documentos: DNI, plano de ubicación del proyecto, memoria descriptiva, título de propiedad
- Paga $5000 por Mercado Pago
- **Expediente N° 2025-0001 creado** - Estado: **Pendiente**

**Día 1 - 14:00hs:** Administrativa María asigna el expediente
- Busca expediente 2025-0001 en "Consulta de Expedientes"
- Lo asigna a **Carlos (Usuario Técnico)**
- Estado: **En revisión técnica**

**Día 2 - 09:00hs:** Carlos (Técnico) trabaja el expediente
- Ve el expediente 2025-0001 en su sección "Recepción"
- **Recepciona el expediente** (marca checkbox y confirma)
- Revisa planos y documentación técnica
- Genera informe técnico favorable
- Va a "Realizar Pase" y **hace pase a Laura (Jurídico)**
- Estado: **En revisión jurídica**

**Día 3 - 11:00hs:** Laura (Jurídico) revisa aspectos legales
- Ve el expediente en su sección "Recepción"
- **Recepciona el expediente**
- Verifica cumplimiento normativo y código de edificación
- Emite dictamen legal favorable
- Va a "Realizar Pase Legal" y **hace pase a Dr. Gómez (Director)**
- Estado: **Pendiente de aprobación**

**Día 4 - 16:00hs:** Dr. Gómez (Director) toma decisión final
- Ve el expediente en su sección "Recepción"
- Hace clic en **"📋 Revisar"**
- Se abre el Modal de Revisión Completa:
  - Revisa información del expediente
  - Ve todos los documentos adjuntos
  - Revisa historial completo (técnico y jurídico favorables)
- Sube documentación adicional: **Resolución N° 123/2025**
- En pestaña "Decisión":
  - Selecciona: **⚪ Aprobar**
  - Escribe comentario: "Se aprueba línea de ribera según informes técnico y legal favorables. Cumple con normativa vigente de recursos hídricos."
  - Confirma decisión
- Estado: **APROBADO** ✅

**Día 4 - 16:05hs:** Juan recibe notificación
- Ingresa a SIGEDEX
- Consulta su expediente 2025-0001
- Ve estado: **APROBADO** (verde)
- Puede descargar la Resolución N° 123/2025 firmada
- **Trámite finalizado exitosamente** ✓

---

## 6. SOLUCIÓN DE PROBLEMAS FRECUENTES

### 6.1 No puedo iniciar sesión

**Problema:** "Usuario o contraseña incorrectos"

**Soluciones:**
1. Verifica que Caps Lock esté desactivado
2. Verifica que tu usuario y contraseña sean correctos
3. Si olvidaste tu contraseña, contacta al administrador
4. Asegúrate de estar registrado en el sistema

---

### 6.2 No puedo subir archivos

**Problema:** "Error al subir archivo"

**Soluciones:**
1. Verifica el tamaño del archivo (máximo 5MB)
2. Verifica el formato (solo PDF, JPG, PNG, DOC, DOCX)
3. Verifica tu conexión a internet
4. Intenta con otro navegador
5. Limpia la caché del navegador

---

### 6.3 No puedo realizar un pase

**Problema:** Aparece "🔒 Sin permiso de pase"

**Explicación:** Solo puedes realizar pases de expedientes que **tú hayas recepcionado**

**Solución:**
1. Verifica que hayas recepcionado el expediente previamente
2. Si otro usuario lo recepcionó después de ti, solo ese usuario puede hacer pases
3. Este control asegura la trazabilidad y responsabilidad

---

### 6.4 El pago no se procesa

**Problema:** Mercado Pago no confirma el pago

**Soluciones:**
1. Verifica que tu tarjeta tenga fondos disponibles
2. Verifica los datos de la tarjeta
3. Intenta con otro medio de pago
4. Si el pago se debitó pero no se reflejó, contacta soporte con:
   - Número de operación
   - Comprobante de pago
   - Número de expediente

---

### 6.5 No veo mis expedientes

**Problema:** La lista está vacía

**Soluciones:**
1. Verifica que hayas iniciado sesión correctamente
2. Si eres ciudadano, verifica que hayas creado expedientes
3. Si eres técnico/jurídico/director, verifica que te hayan asignado expedientes
4. Actualiza la página (F5)
5. Cierra sesión y vuelve a ingresar

---

### 6.6 No puedo aprobar/rechazar como Director

**Problema:** El botón está deshabilitado

**Soluciones:**
1. Verifica que hayas seleccionado una opción (Aprobar o Rechazar)
2. Verifica que hayas escrito un comentario (es obligatorio)
3. Verifica que tengas permisos de Director
4. Actualiza la página

---

## 7. GLOSARIO

**Expediente:** Conjunto de documentos y actuaciones relacionadas a un trámite específico.

**Pase:** Acción de derivar un expediente de un usuario/área a otro.

**Recepción:** Acción de tomar formalmente un expediente asignado para su tratamiento.

**Historial:** Registro cronológico de todas las acciones realizadas sobre un expediente.

**Badge:** Etiqueta visual que indica el estado de un elemento (ej: "✓ Recepcionado").

**Modal:** Ventana emergente que muestra información o solicita datos.

**Firma Digital:** Firma electrónica con validez legal equivalente a firma manuscrita.

**Trazabilidad:** Capacidad de seguir el rastro completo de un expediente.

**Estado del expediente:**
- **Pendiente:** Expediente creado, esperando asignación administrativa
- **En revisión técnica:** Asignado al área técnica para evaluación
- **En revisión jurídica:** Asignado al área legal para evaluación
- **Pendiente de aprobación:** Asignado a Dirección para decisión final
- **Aprobado:** Trámite finalizado exitosamente por el Director
- **Rechazado:** No cumple requisitos, rechazado por el Director

**Tipo de Expediente:**
- **Línea de Ribera:** Determinación de la línea límite entre el dominio público hidráulico y las propiedades privadas en zonas costeras o ribereñas. Necesario para construcciones cercanas a ríos o costas.
- **Constancia de PMRCI:** Constancia de Proyecto de Mensura, Relevamiento, Construcción o Instalación. Certificado que acredita que un proyecto cumple con las normativas técnicas y legales vigentes.

**Prioridad:**
- Esta funcionalidad fue removida del sistema. Todos los expedientes se procesan según orden de llegada y asignación administrativa.

---

## 8. CONTACTO Y SOPORTE

### Mesa de Ayuda

**Horario de atención:**
- Lunes a Viernes: 8:00hs a 18:00hs

**Canales de contacto:**
- 📧 Email: soporte@sigedex.gob.ar
- 📞 Teléfono: 0800-XXX-XXXX
- 💬 Chat en línea: Disponible en la plataforma

### Soporte Técnico

Para problemas técnicos o errores del sistema:
- 📧 Email: sistemas@sigedex.gob.ar
- Incluye en tu consulta:
  - Tipo de usuario
  - Navegador y versión
  - Descripción del problema
  - Capturas de pantalla (si es posible)

### Capacitaciones

Se realizan capacitaciones periódicas para usuarios administrativos, técnicos, jurídicos y directivos.

Consulta el calendario de capacitaciones en:
- Portal interno de capacitación
- Notificaciones del sistema

---

**© 2025 SIGEDEX - Sistema de Gestión de Expedientes Digitales**  
**Versión 1.0 - Noviembre 2025**

---

*Este manual está sujeto a actualizaciones. Última actualización: 14/11/2025*
