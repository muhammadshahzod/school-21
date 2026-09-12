// Shared Prisma `select` fragment for user-as-peer payloads (post authors,
// comment authors, message participants, directory listings).
export const personSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  bio: true,
  skills: true,
  projectTitle: true,
  projectDescription: true,
  lastActiveAt: true,
} as const;
