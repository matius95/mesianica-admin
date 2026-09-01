import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/v1/person
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const barrioId = searchParams.get("barrioId");
    const status = searchParams.get("status");
    const isMember = searchParams.get("isMember");

    const where: any = {
      deletedAt: null, // Soft delete filter
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (barrioId) {
      where.barrioId = barrioId;
    }

    if (status) {
      where.status = status;
    }

    if (isMember !== null && isMember !== undefined && isMember !== "") {
      where.isMember = isMember === "true";
    }

    const persons = await db.person.findMany({
      where,
      include: {
        barrio: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: persons });
  } catch (error: any) {
    console.error("Error in GET /api/v1/person:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener personas" },
      { status: 500 }
    );
  }
}

// POST /api/v1/person
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, isMember, status, barrioId } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "El nombre y apellido son obligatorios." },
        { status: 400 }
      );
    }

    const newPerson = await db.person.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        isMember: isMember ?? true,
        status: status || "ACTIVO",
        barrioId: barrioId || null,
      },
      include: {
        barrio: true,
      },
    });

    return NextResponse.json({ success: true, data: newPerson }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/v1/person:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear persona" },
      { status: 500 }
    );
  }
}
