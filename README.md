# Documentación Técnica: SAT-MOVIL

Bienvenido a la documentación técnica del proyecto **SAT-MOVIL**, la aplicación móvil institucional del Servicio de Administración Tributaria de Ica (SAT ICA). Este documento está diseñado para proporcionar a cualquier desarrollador una comprensión clara de la arquitectura, tecnologías y funcionalidades clave del sistema.

---

## 1. Visión General de la Arquitectura

El proyecto es una aplicación móvil nativa (Android/iOS) con un backend dedicado. Está estructurado como un monorepo lógico con dos directorios principales:

*   **`frontend/`**: Aplicación móvil construida con React Native y Expo.
*   **`backend/`**: API RESTful construida con el framework NestJS.

La comunicación entre el frontend y el backend se realiza a través de peticiones HTTP/REST, aseguradas mediante tokens **JWT (JSON Web Tokens)**.

---

## 2. Stack Tecnológico

### Frontend (Aplicación Móvil)
*   **Framework**: React Native + Expo.
*   **Lenguaje**: TypeScript.
*   **Navegación**: React Navigation.
*   **Gestión de Estado**: React Context API (AuthContext, ThemeContext).
*   **Peticiones HTTP**: Axios.
*   **Almacenamiento Local**: AsyncStorage.
*   **Iconografía**: `lucide-react-native`.

### Backend (API REST)
*   **Framework**: NestJS.
*   **Lenguaje**: TypeScript.
*   **Base de Datos**: Microsoft SQL Server (conectado vía el paquete `mssql`).
*   **Caché y Limitación de Tasa (Rate Limiting)**: Redis (`ioredis`).
*   **Autenticación**: Passport + JWT.
*   **Validación de Datos**: Zod (`nestjs-zod`).
*   **Envío de Correos**: Nodemailer.

---

## 3. Arquitectura del Backend (NestJS)

El backend sigue principios de diseño modular y **Domain-Driven Design (DDD)** simplificado. Cada funcionalidad principal tiene su propio módulo dentro de `src/modules/`:

### Estructura de un Módulo Típico
Cada módulo (ej. `debt`, `auth`) se divide típicamente en:
*   `application/`: Casos de uso (Use Cases) que contienen la lógica de negocio pura.
*   `domain/`: Entidades e interfaces de repositorios que definen el contrato de datos.
*   `infrastructure/`: Implementaciones concretas. Aquí viven los Controladores (Controllers) que exponen los endpoints REST y los Repositorios (`sql-server-*.repository.ts`) que interactúan directamente con SQL Server ejecutando consultas sin procesar o procedimientos almacenados.

### Módulos Existentes
1.  **AuthModule**: Maneja el inicio de sesión, registro (con validación de imágenes/selfies), recuperación de contraseña, cambio de contraseña y el "Modo Invitado". Implementa `JwtStrategy`.
2.  **DebtModule**: Gestión de consultas de deuda (Predial, Arbitrios, Alcabala, Vehicular). Soporta consultas dinámicas.
3.  **PapeletaModule**: Consulta de infracciones de tránsito por placa, DNI o número de papeleta.
4.  **TramiteModule**: Seguimiento del estado de los expedientes documentarios.
5.  **MessageModule**: Sistema de buzón de notificaciones para el contribuyente.

### Seguridad y Rendimiento
*   **ThrottlerGuard**: Prevención global de ataques de fuerza bruta.
*   **GuestLimitGuard**: Limitación estricta de consultas (ej. max 10/día) para usuarios en modo invitado, apoyado en Redis.
*   **Redis**: Se usa para almacenar sesiones activas, códigos temporales de recuperación de contraseña y llevar la cuenta de las consultas de los invitados.

---

## 4. Arquitectura del Frontend (React Native)

El frontend está estructurado en `src/` para separar responsabilidades de la UI:

*   `components/`: Componentes reutilizables de UI (Button, Input, MenuCard, Skeletons).
*   `context/`: Proveedores de estado global:
    *   `AuthContext`: Maneja el ciclo de vida de la sesión del usuario (login, logout, gestión del token JWT en AsyncStorage, detección del rol "invitado").
    *   `ThemeContext`: Maneja el tema visual (Modo Claro / Modo Oscuro).
*   `navigation/`: Configuración del enrutador (Stack Navigator) entre pantallas.
*   `screens/`: Vistas completas de la aplicación (LoginScreen, MenuScreen, DebtInquiryScreen, etc.).
*   `services/`: Capa de abstracción para las llamadas a la API (`api.ts`). Centraliza la instancia de Axios, configurando interceptores para añadir el token JWT y manejar errores globales (ej. error 401 por expiración de sesión).

### Funcionalidades Clave de la UI
*   **Modo Invitado**: Permite a usuarios no autenticados acceder únicamente a las funciones de "Papeletas" y "Trámites". El estado global bloquea visual y lógicamente el acceso a deudas y perfil.
*   **Diseño Premium**: Interfaz moderna con soporte para Modo Oscuro, gradientes suaves, sombras y estados de carga mediante Skeleton Loaders.
*   **Consolidación de Datos**: Las pantallas de resultados (ej. Deudas) utilizan `useMemo` para agrupar y sumarizar eficientemente los datos provenientes del servidor antes de renderizarlos.

---

## 5. Instrucciones Básicas para Desarrollo

### Levantar el Backend
1. Navegar a `/backend`
2. Configurar variables de entorno (Crear archivo `.env` con credenciales de SQL Server, Redis, JWT Secret y SMTP).
3. Asegurarse de tener un servidor Redis ejecutándose localmente o en un contenedor.
4. Instalar dependencias: `npm install`
5. Ejecutar: `npm run start:dev`

### Levantar el Frontend
1. Navegar a `/frontend`
2. Asegurar que la URL de la API en `src/services/api.ts` apunte a la IP local de tu máquina donde corre el backend.
3. Instalar dependencias: `npm install`
4. Ejecutar: `npx expo start` (usar la app Expo Go en un dispositivo físico o emulador).

---
*Documentación generada para mantener el proyecto mantenible y escalable.*
