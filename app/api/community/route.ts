import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const { rows: totalRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM app_users`
    );
    const { rows: onlineRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM app_users WHERE last_active_at > now() - interval '5 minutes'`
    );
    const { rows: topicRows } = await pool.query(
      `SELECT skill, COUNT(*)::int AS count FROM app_posts GROUP BY skill ORDER BY count DESC LIMIT 3`
    );

    const topics = topicRows.map((row) => ({
      name: `#${row.skill.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
      posts: row.count,
      skill: row.skill,
    }));

    return NextResponse.json({
      total: totalRows[0].count,
      online: onlineRows[0].count,
      topics,
    });
  } catch (error) {
    console.error("GET /api/community error:", error);
    return NextResponse.json(
      { error: "Hamjamiyat statistikasini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
