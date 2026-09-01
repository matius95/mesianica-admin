import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/v1/role/[id] (Actualizar datos del rol y acciones asignadas)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, actionIds } = body;

    const existingRole = await db.role.findUnique({ where: { id } });
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: "Rol no encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim().toUpperCase().replace(/\s+/g, "_");
    if (description !== undefined) updateData.description = description;

    // Update RoleActions if actionIds array is provided
    if (Array.isArray(actionIds)) {
      await db.roleAction.deleteMany({ where: { roleId: id } });
      if (actionIds.length > 0) {
        await db.roleAction.createMany({
          data: actionIds.map((actionId: string) => ({
            roleId: id,
            actionId,
          })),
        });
      }
    }

    const updatedRole = await db.role.update({
      where: { id },
      data: updateData,
      include: {
        actions: {
          include: {
            action: true,
          },
        },
        _count: {
          select: { users: true, actions: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedRole });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/role/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar rol" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/role/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if role has users assigned
    const userCount = await db.userRole.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar el rol porque está asignado a ${userCount} usuarios. Reasigna a los usuarios primero.`,
        },
        { status: 400 }
      );
    }

    await db.role.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Rol eliminado exitosamente.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/role/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar rol" },
      { status: 500 }
    );
  }
}
