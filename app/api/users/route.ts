import { NextResponse } from "next/server";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    const { rows } = skill
      ? await pool.query(
          `SELECT * FROM app_users WHERE $1 = ANY(skills) ORDER BY created_at DESC`,
          [skill]
        )
      : await pool.query(`SELECT * FROM app_users ORDER BY created_at DESC`);

    return NextResponse.json(rows.map(toPublicUser));
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchilarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
