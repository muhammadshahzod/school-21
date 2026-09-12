import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    const { rows: postRows } = await pool.query(
      `SELECT id, author_id FROM app_posts WHERE id = $1`,
      [postId]
    );
    if (postRows.length === 0) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }

    const { rows: existing } = await pool.query(
      `SELECT id FROM app_likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existing.length > 0) {
      await pool.query(`DELETE FROM app_likes WHERE id = $1`, [existing[0].id]);
      return NextResponse.json({ liked: false });
    }

    await pool.query(
      `INSERT INTO app_likes (id, post_id, user_id) VALUES ($1, $2, $3)`,
      [genId("l"), postId, userId]
    );

    const authorId = postRows[0].author_id;
    if (authorId !== userId) {
      await pool.query(
        `INSERT INTO app_notifications (id, user_id, actor_id, type, post_id)
         VALUES ($1, $2, $3, 'like', $4)`,
        [genId("n"), authorId, userId, postId]
      );
    }

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json(
      { error: "Like bosishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
