import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSchema, pool, toPublicUser } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const { rows } = await pool.query(`SELECT * FROM app_users WHERE id = $1`, [
      session.user.id,
    ]);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json(toPublicUser(rows[0]));
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { error: "Profilni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, skills, projectTitle, projectDescription, image, openToProjects } = body;

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        { error: "name matn bo'lishi kerak" },
        { status: 400 }
      );
    }
    if (skills !== undefined && !Array.isArray(skills)) {
      return NextResponse.json(
        { error: "skills massiv bo'lishi kerak" },
        { status: 400 }
      );
    }
    if (image !== undefined && typeof image !== "string") {
      return NextResponse.json(
        { error: "image matn bo'lishi kerak" },
        { status: 400 }
      );
    }
    if (typeof image === "string" && image.length > 3_000_000) {
      return NextResponse.json(
        { error: "Rasm hajmi juda katta" },
        { status: 400 }
      );
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (name !== undefined) {
      sets.push(`name = $${i++}`);
      values.push(name.trim());
    }
    if (image !== undefined) {
      sets.push(`image = $${i++}`);
      values.push(image);
    }
    if (bio !== undefined) {
      sets.push(`bio = $${i++}`);
      values.push(String(bio).trim());
    }
    if (skills !== undefined) {
      sets.push(`skills = $${i++}`);
      values.push(skills.filter((s: unknown) => typeof s === "string"));
    }
    if (projectTitle !== undefined) {
      sets.push(`project_title = $${i++}`);
      values.push(String(projectTitle).trim());
    }
    if (projectDescription !== undefined) {
      sets.push(`project_description = $${i++}`);
      values.push(String(projectDescription).trim());
    }
    if (openToProjects !== undefined) {
      sets.push(`open_to_projects = $${i++}`);
      values.push(Boolean(openToProjects));
    }

    if (sets.length > 0) {
      values.push(session.user.id);
      await pool.query(
        `UPDATE app_users SET ${sets.join(", ")} WHERE id = $${i}`,
        values
      );
    }

    const { rows } = await pool.query(`SELECT * FROM app_users WHERE id = $1`, [
      session.user.id,
    ]);
    return NextResponse.json(toPublicUser(rows[0]));
  } catch (error) {
    console.error("PATCH /api/users/me error:", error);
    return NextResponse.json(
      { error: "Profilni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
