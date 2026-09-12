export const POST_SKILLS = [
  "Frontend",
  "Python",
  "Hardware",
  "C / C++",
  "UI / UX",
] as const;

export type PostSkill = (typeof POST_SKILLS)[number];

export function isPostSkill(value: unknown): value is PostSkill {
  return (
    typeof value === "string" &&
    (POST_SKILLS as readonly string[]).includes(value)
  );
}
