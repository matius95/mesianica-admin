import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, getUserActions } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";

// POST /api/v1/auth/login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        person: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVO") {
      return NextResponse.json(
        { success: false, error: "Tu cuenta se encuentra inactiva. Contacta al administrador." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    // Set HTTP-Only Session Cookie with 30-min duration (or configured duration)
    await createSessionCookie(user.id, user.email);

    const userActions = await getUserActions(user.id);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        person: user.person,
        roles: user.roles.map((r) => r.role.name),
        actions: userActions,
      },
      message: "Inicio de sesión exitoso.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/login:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}
