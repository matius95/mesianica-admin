# ⛪ Mesiánica Admin - Sistema Web de Gestión de Iglesia

Sistema web moderno y seguro para la administración integral de la congregación, registro de personas, distribución por sectores/barrios, asignación de Asistentes de Familia, control de usuarios y gestión de permisos basados en **Acciones del Sistema (RBAC)**.

---

## 🌟 REGLA DE ORO DE PERMISOS

> **CADA VEZ QUE SE DESARROLLE E INTEGRE UNA NUEVA FUNCIONALIDAD, MÓDULO O SECCIÓN EN EL SISTEMA, ES OBLIGATORIO REGISTRAR SUS CORRESPONDIENTES ACCIONES EN EL CATÁLOGO DE LA BASE DE DATOS (`Action`).**

---

## 🚀 Stack Tecnológico

- **Frontend:** Next.js (App Router, React 19, TypeScript)
- **Estilos:** Tailwind CSS v4 con tema oscuro moderno, glassmorphism y micro-interacciones.
- **Base de Datos & ORM:** Prisma ORM con SQLite (entorno local cero-configuración) y preparado para PostgreSQL en producción.
- **Seguridad & Autenticación:** Cookies HTTP-Only (`session_token`), expiración de sesión por inactividad de **30 minutos** (configurables), hashing con `bcryptjs` y matriz de permisos por **Acciones del Sistema**.
- **Pruebas Automatizadas:** Vitest.

---

## 🛡️ Arquitectura de Seguridad & Permisos por Acciones

El sistema utiliza una arquitectura de control de accesos basada en acciones de grano fino:

1. **Acciones (`Action`):** Catálogo de permisos específicos del sistema (ejemplo: `crear-usuario`, `editar-persona`, `crear-barrio`, `editar-rol`, `ver-configuraciones`, `editar-configuraciones`).
2. **Roles (`Role`):** Roles predefinidos (`ADMIN`, `ASISTENTE_BARRIO`, `MEMBER`).
3. **Relación Roles × Acciones (`RoleAction`):** Asignación dinámica mediante modales desde la vista de Roles (`/role`).
4. **Relación Usuarios × Roles (`UserRole`):** Permite asignar múltiples roles a una cuenta de usuario desde la vista de Usuarios (`/users`).

---

## ⚡ Guía de Inicio Rápido

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Sincronizar Esquema de Base de Datos
```bash
npx prisma db push
```

### 3. Cargar Datos Iniciales (Roles, Acciones y Admin)
```bash
npx tsx prisma/seed.ts
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Accede a [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🔑 Credenciales por Defecto (Prueba Local)

- **Login URL:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Usuario:** `admin@mesianica.org`
- **Contraseña:** `admin123`

---

## 🧪 Ejecución de Pruebas Automatizadas

```bash
npx vitest run
```
