import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

// POST /api/v1/auth/logout
export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
