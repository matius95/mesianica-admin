import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/role
export async function GET() {
  try {
    const roles = await db.role.findMany({
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    console.error("Error in GET /api/v1/role:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener roles" },
      { status: 500 }
    );
  }
}

// POST /api/v1/role (Crear nuevo rol con acciones seleccionadas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, actionIds } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre del rol es obligatorio." },
        { status: 400 }
      );
    }

    const uppercaseName = name.trim().toUpperCase().replace(/\s+/g, "_");

    const existingRole = await db.role.findUnique({
      where: { name: uppercaseName },
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: `Ya existe un rol con el nombre '${uppercaseName}'.` },
        { status: 400 }
      );
    }

    const newRole = await db.role.create({
      data: {
        name: uppercaseName,
        description: description || null,
        actions: {
          create: (actionIds || []).map((actionId: string) => ({
            actionId,
          })),
        },
      },
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

    return NextResponse.json({ success: true, data: newRole }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/v1/role:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear el rol" },
      { status: 500 }
    );
  }
}
