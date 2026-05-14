# Diagrama Entidad-Relación (ERD) - SIGEDEX

Este documento contiene la representación visual y técnica del modelo de datos actual del Sistema de Gestión de Expedientes (SIGEDEX), basado en el esquema real de la base de datos.

## Diagrama Visual (Mermaid)

```mermaid
erDiagram
    %% Nivel Superior: Configuración y Estructura
    DEPARTAMENTOS ||--o{ USUARIO : "pertenece"
    DEPARTAMENTOS ||--o{ HISTORIAL_EXPEDIENTE : "asignado a"
    
    ROLES ||--o{ USUARIO : "define perfil"
    ROLES ||--o{ ROL_PERMISOS : "agrupa"
    PERMISOS ||--o{ ROL_PERMISOS : "es parte de"
    
    %% Nivel Central: Entidades de Negocio
    USUARIO ||--o{ EXPEDIENTES : "presentante / asignado"
    
    %% Nivel Inferior: Trazabilidad y Operaciones
    EXPEDIENTES ||--o{ DOCUMENTOS : "contiene"
    EXPEDIENTES ||--o{ PAGOS : "asociado a"
    EXPEDIENTES ||--o{ HISTORIAL_EXPEDIENTE : "trazabilidad de pases"
    EXPEDIENTES ||--o{ OBSERVACIONES : "recibe"
    EXPEDIENTES ||--o{ FIRMAS_DIGITALES : "requiere"
    EXPEDIENTES ||--o{ CONSULTAS_EN_TIEMPO_REAL : "consultas"
    EXPEDIENTES ||--o{ LOGS : "auditoría"

    USUARIO ||--o{ DOCUMENTOS : "sube"
    USUARIO ||--o{ PAGOS : "realiza"
    USUARIO ||--o{ HISTORIAL_EXPEDIENTE : "responsable"
    USUARIO ||--o{ NOTIFICACIONES : "recibe"
    USUARIO ||--o{ OBSERVACIONES : "escribe"
    USUARIO ||--o{ FIRMAS_DIGITALES : "firma"
    USUARIO ||--o{ AUDITORIA_SISTEMA : "genera logs"
    USUARIO ||--o{ CONSULTAS_EN_TIEMPO_REAL : "participa"
```

## Explicación por Niveles

### 1. Capa de Definiciones (Nivel Superior)
*   **DEPARTAMENTOS:** Define las áreas físicas/lógicas de la DPA (Administración, Legal, etc.).
*   **ROLES & PERMISOS:** Sistema RBAC (Role-Based Access Control) que utiliza la tabla intermedia `ROL_PERMISOS` para una gestión granular de accesos.

### 2. Capa de Operación (Nivel Central)
*   **USUARIO:** Gestiona los datos de acceso, personales y el vínculo con el departamento/rol.
*   **EXPEDIENTES:** El objeto central del sistema. Contiene el estado actual, prioridad y metadatos de gestión.

### 3. Capa de Soporte y Traza (Nivel Inferior)
*   **HISTORIAL_EXPEDIENTE:** Registra cada "Pase" o cambio de estado, identificando al responsable y el departamento.
*   **DOCUMENTOS:** Archivos PDF/Imágenes asociados a cada expediente.
*   **PAGOS:** Registro de transacciones (Mercado Pago u otros métodos) para la formalización del trámite.
*   **FIRMAS_DIGITALES:** Almacena los hashes y métodos de firma para garantizar la validez legal.
*   **AUDITORÍA (Logs/Auditoría Sistema):** Registro técnico de acciones para seguridad e integridad del sistema.

---
*Documentación generada automáticamente basada en el dump SQL del 20/11/2025.*
