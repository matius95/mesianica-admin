import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/barrio/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barrio = await db.barrio.findUnique({
      where: { id },
      include: {
        members: {
          where: { deletedAt: null },
          orderBy: { lastName: "asc" },
        },
      },
    });

    if (!barrio) {
      return NextResponse.json(
        { success: false, error: "Barrio no encontrado" },
        { status: 404 }
      );
    }

    let assistant = null;
    if (barrio.assistantId) {
      assistant = await db.person.findUnique({
        where: { id: barrio.assistantId },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...barrio,
        assistant,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/barrio/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener barrio" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/barrio/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingBarrio = await db.barrio.findUnique({ where: { id } });
    if (!existingBarrio) {
      return NextResponse.json(
        { success: false, error: "Barrio no encontrado" },
        { status: 404 }
      );
    }

    const updatedBarrio = await db.barrio.update({
      where: { id },
      data: {
        name: body.name ?? existingBarrio.name,
        description: body.description !== undefined ? body.description : existingBarrio.description,
        assistantId: body.assistantId !== undefined ? body.assistantId : existingBarrio.assistantId,
      },
    });

    return NextResponse.json({ success: true, data: updatedBarrio });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/barrio/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar barrio" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/barrio/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if barrio has members
    const memberCount = await db.person.count({
      where: { barrioId: id, deletedAt: null },
    });

    if (memberCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar el barrio porque tiene ${memberCount} personas asignadas. Reasigna a los integrantes primero.`,
        },
        { status: 400 }
      );
    }

    await db.barrio.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Barrio eliminado exitosamente.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/barrio/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar barrio" },
      { status: 500 }
    );
  }
}
