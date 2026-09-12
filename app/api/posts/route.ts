import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";
import { isPostSkill } from "@/lib/skills";

async function getUsersMap() {
  const { rows } = await pool.query(`SELECT * FROM app_users`);
  return new Map(rows.map((row) => [row.id, toPublicUser(row)]));
}

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    const currentUserId = session?.user?.id;

    const usersMap = await getUsersMap();
    const { rows: postRows } = await pool.query(
      `SELECT * FROM app_posts ORDER BY created_at DESC`
    );
    const { rows: likeRows } = await pool.query(`SELECT * FROM app_likes`);
    const { rows: saveRows } = await pool.query(`SELECT * FROM app_saves`);
    const { rows: commentRows } = await pool.query(
      `SELECT * FROM app_comments ORDER BY created_at ASC`
    );

    const posts = postRows.map((post) => {
      const author = usersMap.get(post.author_id);
      if (!author) return null;

      const postLikes = likeRows.filter((l) => l.post_id === post.id);
      const postSaves = saveRows.filter((s) => s.post_id === post.id);
      const postComments = commentRows
        .filter((c) => c.post_id === post.id)
        .map((c) => {
          const commentAuthor = usersMap.get(c.user_id);
          if (!commentAuthor) return null;
          return {
            id: c.id,
            content: c.content,
            createdAt: c.created_at.toISOString(),
            user: commentAuthor,
          };
        })
        .filter(Boolean);

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        skill: post.skill,
        createdAt: post.created_at.toISOString(),
        author,
        _count: { likes: postLikes.length, comments: postComments.length },
        likes: currentUserId
          ? postLikes
              .filter((l) => l.user_id === currentUserId)
              .map((l) => ({ id: l.id }))
          : undefined,
        saves: currentUserId
          ? postSaves
              .filter((s) => s.user_id === currentUserId)
              .map((s) => ({ id: s.id }))
          : undefined,
        comments: postComments,
      };
    });

    return NextResponse.json(posts.filter(Boolean));
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Postlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
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

    const id = genId("p");
    await pool.query(
      `INSERT INTO app_posts (id, author_id, content, image_url, skill) VALUES ($1, $2, $3, $4, $5)`,
      [id, session.user.id, content.trim(), imageUrl || null, skill ?? "Frontend"]
    );

    const { rows } = await pool.query(`SELECT * FROM app_users WHERE id = $1`, [
      session.user.id,
    ]);
    const author = toPublicUser(rows[0]);

    return NextResponse.json(
      {
        id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        skill: skill ?? "Frontend",
        createdAt: new Date().toISOString(),
        author,
        _count: { likes: 0, comments: 0 },
        comments: [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Post yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
