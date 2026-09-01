<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🌟 REGLA DE ORO DEL SISTEMA DE PERMISOS DE MESIÁNICA ADMIN

> **CADA VEZ QUE SE AGREGUE O DESARROLLE UNA NUEVA FUNCIONALIDAD, MÓDULO O SECCIÓN EN EL SISTEMA, SE DEBE CREAR Y REGISTRAR SU CORRESPONDIENTE ACCIÓN EN EL CATÁLOGO DE LA BASE DE DATOS (`Action`).**

### Pautas para Agentes de Código y Desarrolladores:
1. Al crear cualquier nueva ruta de API, módulo o vista protegida, verificar si existen sus acciones asociadas (`ver-[modulo]`, `crear-[modulo]`, `editar-[modulo]`, `eliminar-[modulo]`).
2. Si no existen, incluir la creación de la acción en `prisma/seed.ts` y en la inicialización del módulo.
3. Asignar las nuevas acciones por defecto al rol `ADMIN`.
