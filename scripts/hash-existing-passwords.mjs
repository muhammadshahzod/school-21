import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows } = await pool.query(`SELECT id, password FROM app_users`);
  let count = 0;
  for (const row of rows) {
    // bcrypt hashes always start with $2; skip rows already hashed.
    if (row.password.startsWith("$2")) continue;
    const hashed = await bcrypt.hash(row.password, 10);
    await pool.query(`UPDATE app_users SET password = $1 WHERE id = $2`, [
      hashed,
      row.id,
    ]);
    count++;
  }
  console.log(`Xeshlandi: ${count} ta parol.`);
}

main()
  .catch((error) => {
    console.error("Xatolik:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
