import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool, toPublicUser } from "@/lib/db";
import { calculateProgress } from "@/lib/incubator";

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const session = await auth();
    const currentUserId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    const { rows: projects } = await pool.query(
      `SELECT p.*, 
              u.id as owner_u_id, u.name as owner_name, u.username as owner_username, 
              u.image as owner_image, u.bio as owner_bio, u.skills as owner_skills,
              u.project_title as owner_proj_title, u.project_description as owner_proj_desc,
              u.role as owner_role, u.open_to_projects as owner_open,
              u.last_active_at as owner_last_active, u.created_at as owner_created_at
       FROM incubator_projects p
       JOIN app_users u ON p.owner_id = u.id
       ORDER BY p.updated_at DESC`
    );

    // Fetch members and module submissions to calculate progress for each
    const { rows: allMembers } = await pool.query(
      `SELECT m.project_id, m.user_id, m.role, m.status,
              u.id as u_id, u.name, u.username, u.image, u.bio, u.skills,
              u.project_title, u.project_description, u.role as u_role, u.open_to_projects,
              u.last_active_at, u.created_at
       FROM incubator_project_members m
       JOIN app_users u ON m.user_id = u.id
       WHERE m.status = 'accepted'`
    );

    const { rows: allSubmissions } = await pool.query(
      `SELECT project_id, module_id, status FROM incubator_module_submissions`
    );

    const results = projects.map((p) => {
      const projectMembers = allMembers.filter((m) => m.project_id === p.id);
      const projectSubs = allSubmissions.filter((s) => s.project_id === p.id);
      const progress = calculateProgress(
        projectSubs.map((s) => ({ moduleId: s.module_id, status: s.status }))
      );

      const isMember = currentUserId
        ? projectMembers.some((m) => m.user_id === currentUserId)
        : false;
      const memberRecord = currentUserId
        ? projectMembers.find((m) => m.user_id === currentUserId)
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

      return {
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
        membersCount: projectMembers.length,
        completedModulesCount: progress.completed,
        percentage: progress.percentage,
        isMember,
        memberRole: memberRecord?.role as "owner" | "member" | undefined,
      };
    });

    if (filter === "my" && currentUserId) {
      return NextResponse.json(results.filter((r) => r.isMember));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/incubator/projects error:", error);
    return NextResponse.json(
      { error: "Loyihalarni olishda xatolik yuz berdi" },
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
    const { title, pitch, description, stage, requiredSkills } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Loyiha nomi majburiy" },
        { status: 400 }
      );
    }

    const projectId = genId("proj");
    const cleanTitle = title.trim();
    const cleanPitch = typeof pitch === "string" ? pitch.trim() : "";
    const cleanDesc = typeof description === "string" ? description.trim() : "";
    const cleanStage =
      typeof stage === "string" &&
      ["idea", "prototype", "mvp", "testing", "launched"].includes(stage)
        ? stage
        : "idea";
    const cleanSkills = Array.isArray(requiredSkills)
      ? requiredSkills.filter((s) => typeof s === "string")
      : [];

    // Create project
    await pool.query(
      `INSERT INTO incubator_projects (id, title, pitch, description, stage, required_skills, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        projectId,
        cleanTitle,
        cleanPitch,
        cleanDesc,
        cleanStage,
        cleanSkills,
        session.user.id,
      ]
    );

    // Add creator as owner member
    await pool.query(
      `INSERT INTO incubator_project_members (project_id, user_id, role, status)
       VALUES ($1, $2, 'owner', 'accepted')`,
      [projectId, session.user.id]
    );

    return NextResponse.json(
      {
        id: projectId,
        title: cleanTitle,
        pitch: cleanPitch,
        description: cleanDesc,
        stage: cleanStage,
        requiredSkills: cleanSkills,
        ownerId: session.user.id,
        isMember: true,
        memberRole: "owner",
        completedModulesCount: 0,
        percentage: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/incubator/projects error:", error);
    return NextResponse.json(
      { error: "Loyiha yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
