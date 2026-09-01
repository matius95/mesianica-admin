import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        settings,
        map: settingsMap,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener configuraciones" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/settings (Actualizar parámetros del sistema)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionDurationMinutes, churchName, contactEmail } = body;

    if (sessionDurationMinutes !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "session_duration_minutes" },
        update: { value: String(sessionDurationMinutes) },
        create: {
          key: "session_duration_minutes",
          value: String(sessionDurationMinutes),
          description: "Duración de la sesión activa en minutos antes de caducar.",
        },
      });
    }

    if (churchName !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "church_name" },
        update: { value: String(churchName) },
        create: {
          key: "church_name",
          value: String(churchName),
          description: "Nombre oficial de la congregación.",
        },
      });
    }

    if (contactEmail !== undefined) {
      await db.systemSetting.upsert({
        where: { key: "contact_email" },
        update: { value: String(contactEmail) },
        create: {
          key: "contact_email",
          value: String(contactEmail),
          description: "Correo electrónico de contacto y soporte.",
        },
      });
    }

    const updatedSettings = await db.systemSetting.findMany();

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Configuraciones del sistema actualizadas exitosamente.",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar configuraciones" },
      { status: 500 }
    );
  }
}
