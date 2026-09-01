import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/actions
export async function GET() {
  try {
    const actions = await db.action.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: actions });
  } catch (error: any) {
    console.error("Error in GET /api/v1/actions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener acciones" },
      { status: 500 }
    );
  }
}

// POST /api/v1/actions (Crear nueva acción del sistema)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre de la acción es obligatorio." },
        { status: 400 }
      );
    }

    // Sanitize action slug name
    const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingAction = await db.action.findUnique({
      where: { name: sanitizedName },
    });

    if (existingAction) {
      return NextResponse.json(
        { success: false, error: `Ya existe una acción registrada con el nombre '${sanitizedName}'.` },
        { status: 400 }
      );
    }

    const newAction = await db.action.create({
      data: {
        name: sanitizedName,
        description: description || null,
        category: category?.trim() || "General",
      },
    });

    return NextResponse.json({ success: true, data: newAction }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/v1/actions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear la acción" },
      { status: 500 }
    );
  }
}
