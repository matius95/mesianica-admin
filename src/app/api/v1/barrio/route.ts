import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/barrio
export async function GET() {
  try {
    const barrios = await db.barrio.findMany({
      include: {
        _count: {
          select: {
            members: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Fetch details of assistants if present
    const assistantIds = barrios
      .map((b) => b.assistantId)
      .filter((id): id is string => Boolean(id));

    const assistants = assistantIds.length > 0
      ? await db.person.findMany({
          where: { id: { in: assistantIds }, deletedAt: null },
        })
      : [];

    const assistantMap = new Map(assistants.map((a) => [a.id, a]));

    const result = barrios.map((b) => ({
      ...b,
      assistant: b.assistantId ? assistantMap.get(b.assistantId) || null : null,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in GET /api/v1/barrio:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener barrios" },
      { status: 500 }
    );
  }
}

// POST /api/v1/barrio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, assistantId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre del barrio es obligatorio." },
        { status: 400 }
      );
    }

    const existingBarrio = await db.barrio.findUnique({ where: { name } });
    if (existingBarrio) {
      return NextResponse.json(
        { success: false, error: "Ya existe un barrio con este nombre." },
        { status: 400 }
      );
    }

    const newBarrio = await db.barrio.create({
      data: {
        name,
        description: description || null,
        assistantId: assistantId || null,
      },
    });

    return NextResponse.json({ success: true, data: newBarrio }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/v1/barrio:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear el barrio" },
      { status: 500 }
    );
  }
}
