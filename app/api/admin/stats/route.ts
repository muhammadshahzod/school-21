import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool } from "@/lib/db";
import { getUserRoleAndMembership } from "@/lib/permissions";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }
    const { role } = await getUserRoleAndMembership(session.user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const [users, posts, comments, likes, messages, groups, topPosters] =
      await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS count FROM app_users`),
        pool.query(`SELECT COUNT(*)::int AS count FROM app_posts`),
        pool.query(`SELECT COUNT(*)::int AS count FROM app_comments`),
        pool.query(`SELECT COUNT(*)::int AS count FROM app_likes`),
        pool.query(`SELECT COUNT(*)::int AS count FROM app_messages`),
        pool.query(`SELECT COUNT(*)::int AS count FROM app_groups`),
        pool.query(
          `SELECT u.id, u.name, u.username, u.image, COUNT(p.id)::int AS post_count
           FROM app_users u
           JOIN app_posts p ON p.author_id = u.id
           GROUP BY u.id
           ORDER BY post_count DESC
           LIMIT 5`
        ),
      ]);

    return NextResponse.json({
      totalUsers: users.rows[0].count,
      totalPosts: posts.rows[0].count,
      totalComments: comments.rows[0].count,
      totalLikes: likes.rows[0].count,
      totalMessages: messages.rows[0].count,
      totalGroups: groups.rows[0].count,
      topPosters: topPosters.rows.map((row) => ({
        id: row.id,
        name: row.name,
        username: row.username,
        image: row.image,
        postCount: row.post_count,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Statistikani olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
