import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, genId, pool } from "@/lib/db";
import { canSubmitModule } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id: projectId } = await params;

    const { rows } = await pool.query(
      `SELECT id, title, version_name, created_at, created_by
       FROM incubator_one_pagers
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        versionName: r.version_name,
        createdAt: r.created_at.toISOString(),
        createdBy: r.created_by,
      }))
    );
  } catch (error) {
    console.error("GET /api/incubator/projects/[id]/snapshots error:", error);
    return NextResponse.json(
      { error: "Snapshotlarni olishda xatolik yuz berdi" },
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
    const { id: projectId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const canCreate = await canSubmitModule(currentUserId, projectId);
    if (!canCreate) {
      return NextResponse.json(
        { error: "Faqat loyiha a'zolari snapshot saqlay oladi" },
        { status: 403 }
      );
    }

    const { versionName } = await request.json();

    // Fetch full live one-pager state to freeze
    const { rows: projectRows } = await pool.query(
      `SELECT * FROM incubator_projects WHERE id = $1`,
      [projectId]
    );
    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
    }
    const p = projectRows[0];

    const { rows: subRows } = await pool.query(
      `SELECT module_id, answers, status, version, updated_at
       FROM incubator_module_submissions
       WHERE project_id = $1`,
      [projectId]
    );

    const snapshotData = {
      project: p,
      submissions: subRows,
      frozenAt: new Date().toISOString(),
    };

    const snapshotId = genId("snap");
    const label =
      typeof versionName === "string" && versionName.trim()
        ? versionName.trim()
        : `Snapshot ${new Date().toLocaleDateString("uz-UZ")}`;

    await pool.query(
      `INSERT INTO incubator_one_pagers (id, project_id, title, snapshot_data, version_name, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        snapshotId,
        projectId,
        p.title,
        JSON.stringify(snapshotData),
        label,
        currentUserId,
      ]
    );

    return NextResponse.json({ id: snapshotId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/incubator/projects/[id]/snapshots error:", error);
    return NextResponse.json(
      { error: "Snapshot saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
