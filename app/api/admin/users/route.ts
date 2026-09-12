import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";

const ADMIN_ID = "u_shahzod";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (session?.user?.id !== ADMIN_ID) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { rows } = await pool.query(
      `SELECT * FROM app_users ORDER BY created_at DESC`
    );
    return NextResponse.json(rows.map(toPublicUser));
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchilarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const session = await auth();
    if (session?.user?.id !== ADMIN_ID) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { username, password, name } = await request.json();

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "username maydoni majburiy" },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 4) {
      return NextResponse.json(
        { error: "parol kamida 4 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const { rows: existing } = await pool.query(
      `SELECT id FROM app_users WHERE lower(username) = $1`,
      [cleanUsername]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Bu login band" },
        { status: 409 }
      );
    }

    const id = genId("u");
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO app_users (id, username, password, name) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, cleanUsername, hashed, (name || cleanUsername).trim()]
    );

    return NextResponse.json(toPublicUser(rows[0]), { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchi yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
