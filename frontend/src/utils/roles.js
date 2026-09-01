// where each role lands after login, and the base path for their portal shell
export const ROLE_HOME = {
  Admin: "/admin",
  Teacher: "/teacher",
  Parent: "/parent",
  Student: "/student",
};

export function roleHome(role) {
  return ROLE_HOME[role] || "/";
}
