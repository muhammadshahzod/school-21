import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";
import { isPostSkill } from "@/lib/skills";

export async function PATCH(
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
    const { rows: existing } = await pool.query(
      `SELECT author_id FROM app_posts WHERE id = $1`,
      [postId]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }
    if (existing[0].author_id !== session.user.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const body = await request.json();
    const { content, imageUrl, skill } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content maydoni majburiy" },
        { status: 400 }
      );
    }
    if (skill !== undefined && !isPostSkill(skill)) {
      return NextResponse.json(
        { error: "skill qiymati noto'g'ri" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE app_posts SET content = $1, image_url = $2, skill = $3 WHERE id = $4`,
      [content.trim(), imageUrl || null, skill ?? "Frontend", postId]
    );

    const { rows: postRows } = await pool.query(
      `SELECT * FROM app_posts WHERE id = $1`,
      [postId]
    );
    const post = postRows[0];
    const { rows: userRows } = await pool.query(
      `SELECT * FROM app_users WHERE id = $1`,
      [post.author_id]
    );
    const author = toPublicUser(userRows[0]);

    const { rows: likeRows } = await pool.query(
      `SELECT * FROM app_likes WHERE post_id = $1`,
      [postId]
    );
    const { rows: saveRows } = await pool.query(
      `SELECT * FROM app_saves WHERE post_id = $1`,
      [postId]
    );
    const { rows: reactionRows } = await pool.query(
      `SELECT emoji, user_id FROM app_reactions WHERE post_id = $1`,
      [postId]
    );
    const reactionCounts = new Map<string, number>();
    for (const r of reactionRows) {
      reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) ?? 0) + 1);
    }
    const myReaction =
      reactionRows.find((r) => r.user_id === session.user.id)?.emoji ?? null;
    const { rows: commentRows } = await pool.query(
      `SELECT * FROM app_comments WHERE post_id = $1 ORDER BY created_at ASC`,
      [postId]
    );
    const commentAuthorIds = [...new Set(commentRows.map((c) => c.user_id))];
    const commentAuthors = commentAuthorIds.length
      ? await pool.query(`SELECT * FROM app_users WHERE id = ANY($1)`, [
          commentAuthorIds,
        ])
      : { rows: [] };
    const commentAuthorsMap = new Map(
      commentAuthors.rows.map((row) => [row.id, toPublicUser(row)])
    );

    return NextResponse.json({
      id: post.id,
      content: post.content,
      imageUrl: post.image_url,
      skill: post.skill,
      createdAt: post.created_at.toISOString(),
      author,
      _count: { likes: likeRows.length, comments: commentRows.length },
      likes: likeRows
        .filter((l) => l.user_id === session.user.id)
        .map((l) => ({ id: l.id })),
      saves: saveRows
        .filter((s) => s.user_id === session.user.id)
        .map((s) => ({ id: s.id })),
      reactions: Array.from(reactionCounts.entries()).map(
        ([emoji, count]) => ({ emoji, count })
      ),
      myReaction,
      comments: commentRows
        .map((c) => {
          const commentAuthor = commentAuthorsMap.get(c.user_id);
          if (!commentAuthor) return null;
          return {
            id: c.id,
            content: c.content,
            createdAt: c.created_at.toISOString(),
            user: commentAuthor,
          };
        })
        .filter(Boolean),
    });
  } catch (error) {
    console.error("PATCH /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Postni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { rows } = await pool.query(
      `SELECT author_id FROM app_posts WHERE id = $1`,
      [postId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }
    if (rows[0].author_id !== session.user.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await pool.query(`DELETE FROM app_posts WHERE id = $1`, [postId]);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { error: "Postni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
