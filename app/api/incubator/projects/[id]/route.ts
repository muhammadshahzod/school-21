import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";
import { calculateProgress } from "@/lib/incubator";
import { canEditProject } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id: projectId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { rows: projects } = await pool.query(
      `SELECT p.*, 
              u.id as owner_u_id, u.name as owner_name, u.username as owner_username, 
              u.image as owner_image, u.bio as owner_bio, u.skills as owner_skills,
              u.project_title as owner_proj_title, u.project_description as owner_proj_desc,
              u.role as owner_role, u.open_to_projects as owner_open,
              u.last_active_at as owner_last_active, u.created_at as owner_created_at
       FROM incubator_projects p
       JOIN app_users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [projectId]
    );

    if (projects.length === 0) {
      return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
    }
    const p = projects[0];

    const { rows: memberRows } = await pool.query(
      `SELECT m.project_id, m.user_id, m.role, m.status,
              u.id as u_id, u.name, u.username, u.image, u.bio, u.skills,
              u.project_title, u.project_description, u.role as u_role, u.open_to_projects,
              u.last_active_at, u.created_at
       FROM incubator_project_members m
       JOIN app_users u ON m.user_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.role DESC, m.created_at ASC`,
      [projectId]
    );

    const { rows: submissions } = await pool.query(
      `SELECT id, project_id, module_id, status, version, updated_at
       FROM incubator_module_submissions
       WHERE project_id = $1`,
      [projectId]
    );

    const progress = calculateProgress(
      submissions.map((s) => ({ moduleId: s.module_id, status: s.status }))
    );

    const isMember = currentUserId
      ? memberRows.some((m) => m.user_id === currentUserId && m.status === "accepted")
      : false;
    const currentMember = currentUserId
      ? memberRows.find((m) => m.user_id === currentUserId)
      : null;

    const owner = toPublicUser({
      id: p.owner_u_id,
      name: p.owner_name,
      username: p.owner_username,
      image: p.owner_image,
      bio: p.owner_bio,
      skills: p.owner_skills,
      project_title: p.owner_proj_title,
      project_description: p.owner_proj_desc,
      role: p.owner_role,
      open_to_projects: p.owner_open,
      last_active_at: p.owner_last_active,
      created_at: p.owner_created_at,
      password: "",
    });

    const members = memberRows.map((m) => ({
      projectId: m.project_id,
      userId: m.user_id,
      role: m.role as "owner" | "member",
      status: m.status as "accepted" | "invited" | "declined",
      user: toPublicUser({
        id: m.u_id,
        name: m.name,
        username: m.username,
        image: m.image,
        bio: m.bio,
        skills: m.skills,
        project_title: m.project_title,
        project_description: m.project_description,
        role: m.u_role,
        open_to_projects: m.open_to_projects,
        last_active_at: m.last_active_at,
        created_at: m.created_at,
        password: "",
      }),
    }));

    return NextResponse.json({
      id: p.id,
      title: p.title,
      pitch: p.pitch,
      description: p.description,
      stage: p.stage,
      requiredSkills: p.required_skills || [],
      ownerId: p.owner_id,
      createdAt: p.created_at.toISOString(),
      updatedAt: p.updated_at.toISOString(),
      owner,
      members,
      submissions: submissions.map((s) => ({
        id: s.id,
        projectId: s.project_id,
        moduleId: s.module_id,
        status: s.status,
        version: s.version,
        updatedAt: s.updated_at.toISOString(),
      })),
      completedModulesCount: progress.completed,
      percentage: progress.percentage,
      isMember,
      memberRole: currentMember?.role,
    });
  } catch (error) {
    console.error("GET /api/incubator/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Loyiha tafsilotlarini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

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

    const { id: projectId } = await params;
    const canEdit = await canEditProject(session.user.id, projectId);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Loyihani tahrirlash huquqi faqat egasiga yoki adminga berilgan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, pitch, description, stage, requiredSkills } = body;

    const sets: string[] = ["updated_at = now()"];
    const values: unknown[] = [projectId];
    let i = 2;

    if (typeof title === "string" && title.trim()) {
      sets.push(`title = $${i++}`);
      values.push(title.trim());
    }
    if (typeof pitch === "string") {
      sets.push(`pitch = $${i++}`);
      values.push(pitch.trim());
    }
    if (typeof description === "string") {
      sets.push(`description = $${i++}`);
      values.push(description.trim());
    }
    if (
      typeof stage === "string" &&
      ["idea", "prototype", "mvp", "testing", "launched"].includes(stage)
    ) {
      sets.push(`stage = $${i++}`);
      values.push(stage);
    }
    if (Array.isArray(requiredSkills)) {
      sets.push(`required_skills = $${i++}`);
      values.push(requiredSkills.filter((s) => typeof s === "string"));
    }

    await pool.query(
      `UPDATE incubator_projects SET ${sets.join(", ")} WHERE id = $1`,
      values
    );

    const { rows } = await pool.query(
      `SELECT * FROM incubator_projects WHERE id = $1`,
      [projectId]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PATCH /api/incubator/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Loyihani yangilashda xatolik yuz berdi" },
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

    const { id: projectId } = await params;
    const canEdit = await canEditProject(session.user.id, projectId);
    if (!canEdit) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await pool.query(`DELETE FROM incubator_projects WHERE id = $1`, [projectId]);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/incubator/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Loyihani o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
