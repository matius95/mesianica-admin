import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// GET /api/v1/users
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        person: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("Error in GET /api/v1/users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/v1/users (Creación directa por Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, roleIds, personId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "El email y la contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Ya existe un usuario registrado con este correo." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        email,
        passwordHash,
        status: "ACTIVO",
        personId: personId || null,
        roles: {
          create: (roleIds || []).map((roleId: string) => ({
            roleId,
          })),
        },
      },
      include: {
        person: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/v1/users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear usuario" },
      { status: 500 }
    );
  }
}
