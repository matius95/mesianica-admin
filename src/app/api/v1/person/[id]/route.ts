import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/person/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const person = await db.person.findUnique({
      where: { id },
      include: {
        barrio: true,
      },
    });

    if (!person || person.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error: any) {
    console.error("Error in GET /api/v1/person/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener la persona" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/person/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingPerson = await db.person.findUnique({ where: { id } });
    if (!existingPerson || existingPerson.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    const updatedPerson = await db.person.update({
      where: { id },
      data: {
        firstName: body.firstName ?? existingPerson.firstName,
        lastName: body.lastName ?? existingPerson.lastName,
        email: body.email !== undefined ? body.email : existingPerson.email,
        phone: body.phone !== undefined ? body.phone : existingPerson.phone,
        address: body.address !== undefined ? body.address : existingPerson.address,
        isMember: body.isMember ?? existingPerson.isMember,
        status: body.status ?? existingPerson.status,
        barrioId: body.barrioId !== undefined ? body.barrioId : existingPerson.barrioId,
      },
      include: {
        barrio: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedPerson });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/person/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar la persona" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/person/[id] (Soft Delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingPerson = await db.person.findUnique({ where: { id } });

    if (!existingPerson || existingPerson.deletedAt) {
      return NextResponse.json(
        { success: false, error: "Persona no encontrada" },
        { status: 404 }
      );
    }

    // Perform soft delete by updating deletedAt timestamp
    await db.person.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Persona eliminada correctamente (soft delete).",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/person/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar la persona" },
      { status: 500 }
    );
  }
}
