import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Cargando catálogo de acciones, roles, usuarios y configuraciones...");

  // 1. Catálogo de Acciones del Sistema (REGLA DE ORO: Toda funcionalidad debe registrar su acción)
  const actionsData = [
    // Usuarios
    { name: "ver-usuarios", description: "Ver lista y detalle de usuarios del sistema", category: "Usuarios" },
    { name: "crear-usuario", description: "Crear e invitar nuevos usuarios", category: "Usuarios" },
    { name: "editar-usuario", description: "Modificar roles y contraseñas de usuarios", category: "Usuarios" },
    { name: "eliminar-usuario", description: "Desactivar o eliminar usuarios", category: "Usuarios" },

    // Personas
    { name: "ver-personas", description: "Ver lista y ficha de personas", category: "Personas" },
    { name: "crear-persona", description: "Registrar nuevas personas en la iglesia", category: "Personas" },
    { name: "editar-persona", description: "Modificar datos de personas", category: "Personas" },
    { name: "eliminar-persona", description: "Eliminar (borrado lógico) personas", category: "Personas" },

    // Barrios
    { name: "ver-barrios", description: "Ver sectores y barrios registrados", category: "Barrios" },
    { name: "crear-barrio", description: "Crear nuevos barrios", category: "Barrios" },
    { name: "editar-barrio", description: "Modificar información de barrios", category: "Barrios" },
    { name: "eliminar-barrio", description: "Eliminar barrios sin integrantes", category: "Barrios" },
    { name: "asignar-asistente", description: "Asignar Asistentes de Familia a sectores", category: "Barrios" },

    // Roles & Permisos
    { name: "ver-roles", description: "Ver matriz de roles y acciones", category: "Roles" },
    { name: "editar-rol", description: "Modificar asignación de acciones a roles", category: "Roles" },

    // Configuraciones del Sistema (REGLA DE ORO: Acción creada para la nueva funcionalidad)
    { name: "ver-configuraciones", description: "Ver parámetros de configuración del sistema", category: "Configuraciones" },
    { name: "editar-configuraciones", description: "Modificar parámetros del sistema y duración de sesión", category: "Configuraciones" },
  ];

  const actionsMap = new Map<string, any>();

  for (const act of actionsData) {
    const action = await db.action.upsert({
      where: { name: act.name },
      update: { description: act.description, category: act.category },
      create: act,
    });
    actionsMap.set(act.name, action);
  }

  // 2. Roles
  const adminRole = await db.role.upsert({
    where: { name: "ADMIN" },
    update: { description: "Administrador general con acceso total a todas las acciones." },
    create: {
      name: "ADMIN",
      description: "Administrador general con acceso total a todas las acciones.",
    },
  });

  const assistantRole = await db.role.upsert({
    where: { name: "ASISTENTE_BARRIO" },
    update: { description: "Asistente de Familia a cargo de la gestión de personas en su barrio." },
    create: {
      name: "ASISTENTE_BARRIO",
      description: "Asistente de Familia a cargo de la gestión de personas en su barrio.",
    },
  });

  await db.role.upsert({
    where: { name: "MEMBER" },
    update: { description: "Miembro regular con acceso a consultas." },
    create: {
      name: "MEMBER",
      description: "Miembro regular con acceso a consultas.",
    },
  });

  // 3. Asignar todas las acciones al ROL ADMIN
  for (const action of actionsMap.values()) {
    await db.roleAction.upsert({
      where: {
        roleId_actionId: {
          roleId: adminRole.id,
          actionId: action.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        actionId: action.id,
      },
    });
  }

  // 4. Asignar acciones al ROL ASISTENTE_BARRIO
  const assistantActionNames = [
    "ver-personas",
    "editar-persona",
    "eliminar-persona",
    "ver-barrios",
    "editar-barrio",
  ];

  for (const name of assistantActionNames) {
    const action = actionsMap.get(name);
    if (action) {
      await db.roleAction.upsert({
        where: {
          roleId_actionId: {
            roleId: assistantRole.id,
            actionId: action.id,
          },
        },
        update: {},
        create: {
          roleId: assistantRole.id,
          actionId: action.id,
        },
      });
    }
  }

  // 5. Barrios de prueba
  const barrioCentro = await db.barrio.upsert({
    where: { name: "Barrio Centro" },
    update: {},
    create: { name: "Barrio Centro", description: "Sector central de la ciudad." },
  });

  const barrioNorte = await db.barrio.upsert({
    where: { name: "Barrio Norte" },
    update: {},
    create: { name: "Barrio Norte", description: "Zona norte y alrededores." },
  });

  // 6. Personas de prueba
  const p1 = await db.person.create({
    data: {
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos.mendoza@iglesia.org",
      phone: "+54 9 11 4567-8901",
      address: "Av. Corrientes 1234",
      isMember: true,
      status: "ACTIVO",
      barrioId: barrioCentro.id,
    },
  });

  await db.person.create({
    data: {
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@iglesia.org",
      phone: "+54 9 11 9876-5432",
      address: "Calle Belgrano 567",
      isMember: true,
      status: "ACTIVO",
      barrioId: barrioNorte.id,
    },
  });

  await db.barrio.update({
    where: { id: barrioCentro.id },
    data: { assistantId: p1.id },
  });

  // 7. Usuario Administrador Inicial
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await db.user.upsert({
    where: { email: "admin@mesianica.org" },
    update: { passwordHash: hashedPassword, status: "ACTIVO" },
    create: {
      email: "admin@mesianica.org",
      passwordHash: hashedPassword,
      status: "ACTIVO",
      personId: p1.id,
    },
  });

  await db.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 8. Configuraciones del Sistema Iniciales
  const defaultSettings = [
    { key: "session_duration_minutes", value: "30", description: "Duración de la sesión activa en minutos antes de caducar." },
    { key: "church_name", value: "Iglesia Mesiánica", description: "Nombre oficial de la congregación." },
    { key: "contact_email", value: "admin@mesianica.org", description: "Correo electrónico de contacto y soporte." },
  ];

  for (const set of defaultSettings) {
    await db.systemSetting.upsert({
      where: { key: set.key },
      update: { value: set.value, description: set.description },
      create: set,
    });
  }

  console.log("✅ Acciones, roles, usuario admin y configuraciones del sistema cargados con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
