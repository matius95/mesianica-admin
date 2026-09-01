import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";

describe("Pruebas de la Entidad Persona y Borrado Lógico", () => {
  let createdPersonId: string;

  afterAll(async () => {
    if (createdPersonId) {
      await db.person.delete({ where: { id: createdPersonId } }).catch(() => {});
    }
    await db.$disconnect();
  });

  it("Debe crear una nueva persona correctamente en la base de datos", async () => {
    const person = await db.person.create({
      data: {
        firstName: "Test",
        lastName: "Pruebas",
        email: "test.persona@iglesia.org",
        phone: "+54 9 11 0000-1111",
        isMember: true,
        status: "ACTIVO",
      },
    });

    createdPersonId = person.id;
    expect(person.id).toBeDefined();
    expect(person.firstName).toBe("Test");
    expect(person.deletedAt).toBeNull();
  });

  it("Debe realizar el borrado lógico de una persona estableciendo deletedAt", async () => {
    expect(createdPersonId).toBeDefined();

    // Perform soft delete
    const softDeleted = await db.person.update({
      where: { id: createdPersonId },
      data: { deletedAt: new Date() },
    });

    expect(softDeleted.deletedAt).not.toBeNull();

    // Verify it is excluded from active query
    const activePersons = await db.person.findMany({
      where: { id: createdPersonId, deletedAt: null },
    });

    expect(activePersons.length).toBe(0);
  });
});
