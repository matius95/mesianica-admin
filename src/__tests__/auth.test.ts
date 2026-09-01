import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, comparePassword, getUserActions, hasAction } from "@/lib/auth";
import { db } from "@/lib/db";

describe("Pruebas del Módulo de Autenticación y Permisos por Acciones", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Setup test user with ADMIN role
    const adminRole = await db.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) return;

    const passHash = await hashPassword("testpassword123");
    const testUser = await db.user.create({
      data: {
        email: `test_${Date.now()}@iglesia.org`,
        passwordHash: passHash,
        status: "ACTIVO",
        roles: {
          create: [{ roleId: adminRole.id }],
        },
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await db.user.delete({ where: { id: testUserId } });
    }
    await db.$disconnect();
  });

  it("Debe generar un hash de contraseña válido", async () => {
    const rawPass = "miClaveSegura123";
    const hash = await hashPassword(rawPass);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPass);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("Debe verificar correctamente la contraseña con comparePassword", async () => {
    const rawPass = "claveSuperSecret4";
    const hash = await hashPassword(rawPass);

    const isMatch = await comparePassword(rawPass, hash);
    const isWrongMatch = await comparePassword("claveErronea", hash);

    expect(isMatch).toBe(true);
    expect(isWrongMatch).toBe(false);
  });

  it("Debe resolver las acciones del usuario ADMIN correctamente", async () => {
    if (!testUserId) return;
    const actions = await getUserActions(testUserId);
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions).toContain("crear-usuario");
    expect(actions).toContain("crear-persona");
    expect(actions).toContain("editar-barrio");
  });

  it("Debe validar el permiso de una acción específica mediante hasAction", async () => {
    if (!testUserId) return;
    const canCreateUser = await hasAction(testUserId, "crear-usuario");
    const canNonExistent = await hasAction(testUserId, "accion-inexistente");

    expect(canCreateUser).toBe(true);
    expect(canNonExistent).toBe(false);
  });
});
