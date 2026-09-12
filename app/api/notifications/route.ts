import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT n.id AS notif_id, n.type AS notif_type, n.read AS notif_read,
              n.created_at AS notif_created_at, n.post_id AS notif_post_id,
              p.content AS post_content,
              u.*
       FROM app_notifications n
       JOIN app_users u ON u.id = n.actor_id
       LEFT JOIN app_posts p ON p.id = n.post_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [session.user.id]
    );

    return NextResponse.json(
      rows.map((row) => ({
        id: row.notif_id,
        type: row.notif_type,
        read: row.notif_read,
        createdAt: row.notif_created_at.toISOString(),
        postId: row.notif_post_id,
        postPreview: row.post_content
          ? String(row.post_content).slice(0, 80)
          : null,
        actor: toPublicUser(row),
      }))
    );
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "Bildirishnomalarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
