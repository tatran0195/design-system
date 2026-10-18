import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react';
import { useProjects } from '@/entities/project/api';
import type { Project } from '@/entities/project/model';
import { selectActiveProject } from './selection';

const STORAGE_KEY = 'nibleaf.activeProjectId';

interface ProjectContextValue {
  activeProject: Project | null;
  activeProjectId: string | undefined;
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  setActiveProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const readStored = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects, isPending, isError } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(() => readStored());
  const list = useMemo(() => projects ?? [], [projects]);

  const setActiveProject = useCallback((projectId: string) => {
    setSelectedId(projectId);
    try {
      window.localStorage.setItem(STORAGE_KEY, projectId);
    } catch {
      // ignore
    }
  }, []);

  const activeProject = useMemo(() => selectActiveProject(list, selectedId), [list, selectedId]);

  const value = useMemo<ProjectContextValue>(
    () => ({ activeProject, activeProjectId: activeProject?.id, projects: list, setActiveProject, isLoading: isPending, isError }),
    [activeProject, list, setActiveProject, isPending, isError],
  );

  return <ProjectContext value={value}>{children}</ProjectContext>;
}
