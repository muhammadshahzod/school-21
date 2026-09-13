import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";
import { isReactionEmoji } from "@/lib/reactions";

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
    const { emoji } = await request.json();
    if (!isReactionEmoji(emoji)) {
      return NextResponse.json(
        { error: "emoji qiymati noto'g'ri" },
        { status: 400 }
      );
    }

    const { rows: postRows } = await pool.query(
      `SELECT id FROM app_posts WHERE id = $1`,
      [postId]
    );
    if (postRows.length === 0) {
      return NextResponse.json({ error: "Post topilmadi" }, { status: 404 });
    }

    const { rows: existing } = await pool.query(
      `SELECT emoji FROM app_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, session.user.id]
    );

    if (existing.length > 0 && existing[0].emoji === emoji) {
      await pool.query(
        `DELETE FROM app_reactions WHERE post_id = $1 AND user_id = $2`,
        [postId, session.user.id]
      );
    } else {
      await pool.query(
        `INSERT INTO app_reactions (id, post_id, user_id, emoji)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (post_id, user_id)
         DO UPDATE SET emoji = excluded.emoji, created_at = now()`,
        [genId("r"), postId, session.user.id, emoji]
      );
    }

    const { rows: allReactions } = await pool.query(
      `SELECT emoji, user_id FROM app_reactions WHERE post_id = $1`,
      [postId]
    );
    const counts = new Map<string, number>();
    for (const row of allReactions) {
      counts.set(row.emoji, (counts.get(row.emoji) ?? 0) + 1);
    }
    const mine = allReactions.find((r) => r.user_id === session.user.id);

    return NextResponse.json({
      reactions: Array.from(counts.entries()).map(([reactionEmoji, count]) => ({
        emoji: reactionEmoji,
        count,
      })),
      myReaction: mine ? mine.emoji : null,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/reactions error:", error);
    return NextResponse.json(
      { error: "Reaktsiya qo'shishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
