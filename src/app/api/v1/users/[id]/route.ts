import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// PUT /api/v1/users/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, password, roleIds, personId } = body;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (personId !== undefined) updateData.personId = personId || null;
    if (password && password.trim() !== "") {
      updateData.passwordHash = await hashPassword(password);
    }

    // Update UserRoles if roleIds provided
    if (Array.isArray(roleIds)) {
      await db.userRole.deleteMany({ where: { userId: id } });
      await db.userRole.createMany({
        data: roleIds.map((roleId: string) => ({
          userId: id,
          roleId,
        })),
      });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        person: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/users/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/[id] (Desactivar / Eliminar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Usuario eliminado con éxito." });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/users/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
