import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";
import { canLeaveFeedback } from "@/lib/permissions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    await ensureSchema();
    const { id: projectId, moduleId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const canFeedback = await canLeaveFeedback(currentUserId);
    if (!canFeedback) {
      return NextResponse.json(
        { error: "Faqat moderator yoki admin fikr qoldira oladi" },
        { status: 403 }
      );
    }

    const { feedback } = await request.json();
    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { error: "Fikr matni bo'sh bo'lishi mumkin emas" },
        { status: 400 }
      );
    }

    const feedbackId = genId("fb");
    await pool.query(
      `INSERT INTO incubator_module_feedback (id, project_id, module_id, author_id, feedback)
       VALUES ($1, $2, $3, $4, $5)`,
      [feedbackId, projectId, moduleId, currentUserId, feedback.trim()]
    );

    return NextResponse.json(
      { id: feedbackId, feedback: feedback.trim() },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/incubator/projects/[id]/modules/[moduleId]/feedback error:",
      error
    );
    return NextResponse.json(
      { error: "Fikr qoldirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
