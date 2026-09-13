import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";
import { getModuleConfig } from "@/lib/incubator";
import {
  canLeaveFeedback,
  canSubmitModule,
  canViewProject,
} from "@/lib/permissions";

export async function GET(
  _request: Request,
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

    const config = getModuleConfig(moduleId);
    if (!config) {
      return NextResponse.json(
        { error: "Noma'lum modul ID" },
        { status: 404 }
      );
    }

    // Access control: only project members, moderators or admins can view private answers
    const canView = await canViewProject(currentUserId, projectId);
    if (!canView) {
      return NextResponse.json(
        { error: "Ushbu loyiha moduliga kirish huquqiga ega emassiz" },
        { status: 403 }
      );
    }

    const { rows: submissionRows } = await pool.query(
      `SELECT * FROM incubator_module_submissions WHERE project_id = $1 AND module_id = $2`,
      [projectId, moduleId]
    );
    const sub = submissionRows[0] || null;

    const { rows: feedbackRows } = await pool.query(
      `SELECT f.*, 
              u.id as u_id, u.name, u.username, u.image, u.bio, u.skills,
              u.project_title, u.project_description, u.role as u_role, u.open_to_projects,
              u.last_active_at, u.created_at
       FROM incubator_module_feedback f
       JOIN app_users u ON f.author_id = u.id
       WHERE f.project_id = $1 AND f.module_id = $2
       ORDER BY f.created_at ASC`,
      [projectId, moduleId]
    );

    const feedbacks = feedbackRows.map((f) => ({
      id: f.id,
      projectId: f.project_id,
      moduleId: f.module_id,
      feedback: f.feedback,
      createdAt: f.created_at.toISOString(),
      author: toPublicUser({
        id: f.u_id,
        name: f.name,
        username: f.username,
        image: f.image,
        bio: f.bio,
        skills: f.skills,
        project_title: f.project_title,
        project_description: f.project_description,
        role: f.u_role,
        open_to_projects: f.open_to_projects,
        last_active_at: f.last_active_at,
        created_at: f.created_at,
        password: "",
      }),
    }));

    const canEdit = await canSubmitModule(currentUserId, projectId);
    const canFeedback = await canLeaveFeedback(currentUserId);

    return NextResponse.json({
      submission: sub
        ? {
            id: sub.id,
            projectId: sub.project_id,
            moduleId: sub.module_id,
            answers: sub.answers || {},
            status: sub.status,
            version: sub.version || 1,
            updatedAt: sub.updated_at.toISOString(),
          }
        : null,
      feedbacks,
      canEdit,
      canFeedback,
    });
  } catch (error) {
    console.error("GET /api/incubator/projects/[id]/modules/[moduleId] error:", error);
    return NextResponse.json(
      { error: "Modul ma'lumotlarini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const config = getModuleConfig(moduleId);
    if (!config) {
      return NextResponse.json(
        { error: "Noma'lum modul ID" },
        { status: 404 }
      );
    }

    // Permission check: only members of this project or admin can submit/save
    const canEdit = await canSubmitModule(currentUserId, projectId);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Siz bu loyiha a'zosi emassiz va javob saqlay olmaysiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { answers, status, version } = body;

    const cleanAnswers: Record<string, string> = {};
    if (answers && typeof answers === "object") {
      for (const [k, v] of Object.entries(answers)) {
        if (typeof v === "string") {
          cleanAnswers[k] = v;
        }
      }
    }

    const cleanStatus = status === "submitted" ? "submitted" : "draft";
    const clientVersion = typeof version === "number" ? version : 1;

    // Check existing submission for optimistic locking
    const { rows: existingRows } = await pool.query(
      `SELECT id, version FROM incubator_module_submissions WHERE project_id = $1 AND module_id = $2`,
      [projectId, moduleId]
    );

    const existing = existingRows[0];
    let nextVersion = 1;

    if (existing) {
      // If server version is greater than client version, conflict!
      if (existing.version > clientVersion) {
        return NextResponse.json(
          {
            error:
              "Ushbu modul boshqa jamoadoshingiz tomonidan yangilangan. Iltimos sahifani yangilang.",
            serverVersion: existing.version,
          },
          { status: 409 }
        );
      }
      nextVersion = existing.version + 1;

      await pool.query(
        `UPDATE incubator_module_submissions
         SET answers = $1, status = $2, version = $3, submitted_by = $4, updated_at = now()
         WHERE id = $5`,
        [
          JSON.stringify(cleanAnswers),
          cleanStatus,
          nextVersion,
          currentUserId,
          existing.id,
        ]
      );
    } else {
      const subId = genId("sub");
      await pool.query(
        `INSERT INTO incubator_module_submissions (id, project_id, module_id, answers, status, version, submitted_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          subId,
          projectId,
          moduleId,
          JSON.stringify(cleanAnswers),
          cleanStatus,
          1,
          currentUserId,
        ]
      );
      nextVersion = 1;
    }

    // Touch project updated_at
    await pool.query(
      `UPDATE incubator_projects SET updated_at = now() WHERE id = $1`,
      [projectId]
    );

    return NextResponse.json({
      success: true,
      version: nextVersion,
      status: cleanStatus,
    });
  } catch (error) {
    console.error("PUT /api/incubator/projects/[id]/modules/[moduleId] error:", error);
    return NextResponse.json(
      { error: "Javobni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
