# Resumen Técnico y Arquitectónico: SIGEDEX (Sistema de Gestión de Expedientes)

Este documento detalla la estructura, arquitectura y lógica de negocio del sistema, pensado para una defensa técnica profunda (nivel universitario/profesional).

---

## 1. Arquitectura General y Patrón de Diseño
El sistema utiliza una arquitectura **Cliente-Servidor** separada y un patrón fuertemente inspirado en **MVC (Modelo-Vista-Controlador)**.
*   **Vista (Frontend):** Delegada exclusivamente a React (Vite). Consume servicios a través de una API REST.
*   **Controlador (Backend):** Express.js recibe peticiones HTTP, aplica reglas de negocio y responde con formato JSON.
*   **Modelo (Base de Datos):** Base de datos relacional MySQL donde los datos y relaciones se preservan.

---

## 2. Explicación Detallada de la Estructura de Carpetas

A nivel código, el proyecto está completamente desacoplado (Frontend por un lado, Backend por otro). Esto aumenta la escalabilidad y facilita el mantenimiento. A continuación, el rol de cada directorio vital:

### 📁 BACKEND (Motor del Sistema y API REST)
Esta sección aloja el servidor Node.js/Express. Responsable de la seguridad, lógica de negocio y contacto con MySQL.

*   `backEnd/index.js` *(Punto de entrada)*: Es el orquestador principal. Inicializa el servidor Express en el puerto 8000, configura los permisos CORS (para permitir al frontend hablar con él) y asocia las rutas a sus respectivos módulos.
*   `backEnd/configDB/`: 
    *   **Función:** Centralizar la conexión a la base de datos MySQL (archivo `dataBase.js`).
    *   **Por qué importa:** Evita abrir múltiples conexiones a la DB en cada archivo, utilizando una única instancia base (o pool de conexiones) para optimizar el rendimiento y controlar credenciales en un solo lugar seguro.
*   `backEnd/controllers/`: 
    *   **Función:** Contiene la verdadera **"Lógica de Negocio"**. 
    *   **Por qué importa:** Si un usuario quiere generar un nuevo trámite, la petición HTTP llega a la ruta, pero la ruta la manda al "controlador". El controlador valida que los datos sean correctos, realiza la consulta en SQL (INSERT/UPDATE/SELECT) utilizando parámetros seguros para evitar *Inyección SQL*, y luego emite la respuesta (ej. `{status: 200, message: "Trámite creado"}`).
*   `backEnd/routes/`: 
    *   **Función:** Define los *Endpoints* o URLs de la API (ejemplo: `/expedientes/crear`, `/pagos/validar`).
    *   **Por qué importa:** Actúa como recepcionista. Mantiene el código ordenado. Cada archivo en esta carpeta mapea URLs específicas a funciones dentro de la carpeta `controllers/`.
*   `backEnd/uploads/`: 
    *   **Función:** Almacenamiento local para los archivos estáticos y documentos (PDFs, imágenes de comprobantes) subidos por los presentantes durante el flujo del trámite.
*   `backEnd/utils/`: 
    *   **Función:** Funciones utilitarias ("helpers") e integraciones de terceros. Aquí se alojan, por ejemplo, scripts de envío de correos confidenciales (OTP), funciones de validación de fechas u otras lógicas universales.

### 📁 FRONTEND (Interfaz de Usuario y SPA)
Desarrollado en React bajo Vite. Sigue el concepto de **Single Page Application (SPA)**, lo cual significa que el navegador carga la página una sola vez y luego reescribe su contenido dinámicamente, dando una experiencia fluida e inmediata sin recargar la pestaña.

*   `frontEnd/src/Components/`:
    *   **Función:** Aloja elementos modulares de la interfaz (Tablas, Botones, Menús, Modales para PDFs).
    *   **Por qué importa:** En React, dividimos la interfaz en componentes. Retorna "bloques de lego" reutilizables. Por ejemplo, en lugar de escribir la misma tabla en la vista del Técnico y del Director, se crea un componente `<TablaExpedientes />` que se reutiliza pasándole diferentes datos.
*   `frontEnd/src/Pages/`:
    *   **Función:** Agrupa diferentes "Components" para conformar la vista principal de la pantalla entera.
    *   **Por qué importa:** Representan las "pantallas" lógicas. Ejemplos críticos son `UsuarioTecnicoPage.jsx` (Bandeja de Entrada del Técnico) o `NuevoTramite_pagoPage.jsx`. Estas Pages son las que típicamente importan a `axios` para ir a buscar datos al Backend (Fetch) cuando el componente se carga.
*   `frontEnd/src/Routers/`:
    *   **Función:** Utiliza `react-router-dom` para gestionar la navegación.
    *   **Por qué importa:** Define qué **Page** se mostrará de acuerdo a la URL del navegador (`/login`, `/panel-tecnico`, etc.). Además, aplica la protección de rutas: inspecciona si el usuario actual tiene el "Rol" adecuado antes de cruzar hacia una Page protegida.

---

## 3. Flujos Técnicos Claves (Para Exponer)

Para demostrar dominio, puedes apoyarte en estos tres flujos críticos explicando qué hacen de fondo:

### A. Autenticación y Carga Dinámica (Login)
1. El usuario envía credenciales desde la vista React (Page).
2. El **Controller** del backend en `/usuarios` verifica contra MySQL que el usuario existe y su clave es correcta.
3. El frontend recibe el "Rol" del usuario (ej: 2 para Técnico) y el **Router** dinámicamente lo redirige hacia su bandeja de entrada correspondiente.

### B. Flujo de Transacción de un Trámite y Pagos
1. **Frontend:** El presentante llena un formulario. Ese estado se guarda temporalmente en React. 
2. **Mercado Pago (`NuevoTramite_pagoPage`):** Al pasar a la etapa de pago, se abre un portal al servicio tercero de MercadoPago.
3. **Formalización (Backend `expediente.js` controller):** Una vez que el usuario consigue el ID de comprobante, lo entrega al sistema. El controlador ejecuta una transacción SQL para insertar el Expediente amarrándolo al `comprobante_pago`, registrando historial y marcándolo como "En Revisión".

### C. Sistema de Movimiento de Expedientes (Historial)
1. Cuando el Técnico aprueba los papeles, ejecuta otra petición hacia el backend.
2. El controlador de este proceso cambia la `id_departamento` del expediente (por ejemplo, pasándolo de Técnico a Director).
3. Automáticamente, el controlador también hace un `INSERT` en la tabla de `historial_expedientes` para dejar trazabilidad inmutable de quién y cuándo generó el pase, brindando un esquema de auditoría transparente.

--- 

## 4. Conclusión Profesional de Cierre (Checklist)
Al finalizar la defensa técnica, no olvides destacar que este sistema cumple con los criterios de desarrollo moderno:
*   **Modularidad:** Código altamente separado (frontend / rutas / controladores).
*   **Auditoría:** Cada cambio de estado de un trámite queda traceado en bases de datos.
*   **Fluidez UX:** Al ser una SPA en React, el usuario percibe rapidez y modernidad ya que las demoras de recarga de red desaparecen.
