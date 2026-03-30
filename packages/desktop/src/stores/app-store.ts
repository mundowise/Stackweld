import { create } from "zustand";

// Types matching the CLI's data model
interface Technology {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultVersion: string;
  defaultPort?: number;
  requires: string[];
  incompatibleWith: string[];
  suggestedWith: string[];
  officialScaffold?: string | null;
  dockerImage?: string | null;
  tags: string[];
}

interface StackTechnology {
  technologyId: string;
  version: string;
  port?: number;
}

interface StackDefinition {
  id: string;
  name: string;
  description: string;
  profile: string;
  technologies: StackTechnology[];
  createdAt: string;
  updatedAt: string;
  version: number;
  tags: string[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  technologyIds: string[];
  profile: string;
}

interface ServiceStatus {
  name: string;
  status: "running" | "healthy" | "unhealthy" | "exited" | "stopped" | "not_started";
  port?: number;
  healthCheck?: "passing" | "failing" | "none";
}

type Page = "dashboard" | "builder" | "catalog" | "stack-detail" | "runtime" | "ai" | "settings";

interface AppState {
  // Navigation
  currentPage: Page;
  setPage: (page: Page) => void;

  // Data
  technologies: Technology[];
  stacks: StackDefinition[];
  templates: Template[];
  services: ServiceStatus[];
  selectedStackId: string | null;

  // Actions
  setTechnologies: (techs: Technology[]) => void;
  setStacks: (stacks: StackDefinition[]) => void;
  setTemplates: (templates: Template[]) => void;
  setServices: (services: ServiceStatus[]) => void;
  selectStack: (id: string | null) => void;

  // Builder state
  builderTechs: string[];
  builderProfile: string;
  builderName: string;
  toggleBuilderTech: (id: string) => void;
  setBuilderProfile: (profile: string) => void;
  setBuilderName: (name: string) => void;
  resetBuilder: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "dashboard",
  setPage: (page) => set({ currentPage: page }),

  technologies: [],
  stacks: [],
  templates: [],
  services: [],
  selectedStackId: null,

  setTechnologies: (technologies) => set({ technologies }),
  setStacks: (stacks) => set({ stacks }),
  setTemplates: (templates) => set({ templates }),
  setServices: (services) => set({ services }),
  selectStack: (selectedStackId) =>
    set({ selectedStackId, currentPage: selectedStackId ? "stack-detail" : "dashboard" }),

  builderTechs: [],
  builderProfile: "standard",
  builderName: "",
  toggleBuilderTech: (id) =>
    set((state) => ({
      builderTechs: state.builderTechs.includes(id)
        ? state.builderTechs.filter((t) => t !== id)
        : [...state.builderTechs, id],
    })),
  setBuilderProfile: (builderProfile) => set({ builderProfile }),
  setBuilderName: (builderName) => set({ builderName }),
  resetBuilder: () => set({ builderTechs: [], builderProfile: "standard", builderName: "" }),

  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export type { Page, ServiceStatus, StackDefinition, StackTechnology, Technology, Template };
