import type { Template } from "@stackweld/core";

export const astroLanding: Template = {
  id: "astro-landing",
  name: "Astro Landing Page",
  description: "Fast static landing page with Astro, Tailwind CSS, and TypeScript",
  technologyIds: ["astro", "nodejs", "typescript", "tailwindcss"],
  profile: "lightweight",
  scaffoldSteps: [
    {
      name: "Create Astro project",
      command:
        "npm create astro@latest {{projectName}} -- --template minimal --install --no-git --typescript strict",
    },
    {
      name: "Add Tailwind integration",
      command: "cd {{projectName}} && npx astro add tailwind -y",
    },
  ],
  overrides: [
    {
      path: ".env.example",
      content: ["PUBLIC_SITE_URL=http://localhost:4321", "PUBLIC_SITE_TITLE={{projectName}}"].join(
        "\n",
      ),
    },
  ],
  hooks: [
    {
      timing: "post-scaffold",
      name: "Install dependencies",
      command: "cd {{projectName}} && npm install",
      description: "Install npm dependencies",
      requiresConfirmation: false,
    },
  ],
  variables: {
    projectName: "my-landing",
  },
};
