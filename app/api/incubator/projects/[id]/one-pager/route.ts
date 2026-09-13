import { NextResponse } from "next/server";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";
import { calculateProgress } from "@/lib/incubator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id: projectId } = await params;

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
      `SELECT u.id as u_id, u.name, u.username, u.image, u.bio, u.skills,
              u.project_title, u.project_description, u.role as u_role, u.open_to_projects,
              u.last_active_at, u.created_at
       FROM incubator_project_members m
       JOIN app_users u ON m.user_id = u.id
       WHERE m.project_id = $1 AND m.status = 'accepted'`,
      [projectId]
    );

    const { rows: subRows } = await pool.query(
      `SELECT module_id, answers, status, version, updated_at
       FROM incubator_module_submissions
       WHERE project_id = $1`,
      [projectId]
    );

    const submissions: Record<string, Record<string, string>> = {};
    const submissionStatuses: Record<string, string> = {};

    for (const sub of subRows) {
      submissions[sub.module_id] = sub.answers || {};
      submissionStatuses[sub.module_id] = sub.status;
    }

    const progress = calculateProgress(
      subRows.map((s) => ({ moduleId: s.module_id, status: s.status }))
    );

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

    const members = memberRows.map((m) =>
      toPublicUser({
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
      })
    );

    return NextResponse.json({
      project: {
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
      },
      members,
      submissions,
      submissionStatuses,
      progress: {
        completed: progress.completed,
        total: progress.total,
        percentage: progress.percentage,
      },
    });
  } catch (error) {
    console.error("GET /api/incubator/projects/[id]/one-pager error:", error);
    return NextResponse.json(
      { error: "One-pager ma'lumotlarini olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
