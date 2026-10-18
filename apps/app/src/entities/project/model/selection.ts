/** A missing/stale preference is not server state and must not suppress the
 * available list. Query ordering defines the visible fallback. */
export function selectActiveProject<Project extends { id: string }>(projects: readonly Project[], preferredId: string | null): Project | null {
  return projects.find((project) => project.id === preferredId) ?? projects[0] ?? null;
}
