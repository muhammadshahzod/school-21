import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id: postId } = await params;

    const { rows } = await pool.query(
      `SELECT
         c.id AS comment_id, c.content AS comment_content, c.created_at AS comment_created_at,
         u.*
       FROM app_comments c
       JOIN app_users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    const comments = rows.map((row) => ({
      id: row.comment_id,
      content: row.comment_content,
      createdAt: row.comment_created_at.toISOString(),
      user: toPublicUser(row),
    }));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Kommentlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { id: postId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }

    const { rows: postRows } = await pool.query(
      `SELECT id, author_id FROM app_posts WHERE id = $1`,
      [postId]
    );
    if (postRows.length === 0) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }

    const id = genId("c");
    await pool.query(
      `INSERT INTO app_comments (id, post_id, user_id, content) VALUES ($1, $2, $3, $4)`,
      [id, postId, session.user.id, content.trim()]
    );

    const authorId = postRows[0].author_id;
    if (authorId !== session.user.id) {
      await pool.query(
        `INSERT INTO app_notifications (id, user_id, actor_id, type, post_id)
         VALUES ($1, $2, $3, 'comment', $4)`,
        [genId("n"), authorId, session.user.id, postId]
      );
    }

    const { rows: userRows } = await pool.query(
      `SELECT * FROM app_users WHERE id = $1`,
      [session.user.id]
    );

    return NextResponse.json(
      {
        id,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        user: toPublicUser(userRows[0]),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { error: "Komment qo'shishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
