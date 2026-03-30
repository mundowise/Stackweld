/**
 * Learning Resources — Curated learning paths for technologies in the registry.
 */

export interface LearningResource {
  title: string;
  url: string;
  type: "docs" | "tutorial" | "video" | "course" | "book";
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const LEARNING_RESOURCES: Record<string, LearningResource[]> = {
  nextjs: [
    {
      title: "Official Documentation",
      url: "https://nextjs.org/docs",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Learn Next.js",
      url: "https://nextjs.org/learn",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "App Router Deep Dive",
      url: "https://nextjs.org/docs/app",
      type: "docs",
      difficulty: "intermediate",
    },
    {
      title: "Data Fetching Patterns",
      url: "https://nextjs.org/docs/app/building-your-application/data-fetching",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  react: [
    {
      title: "Official Documentation",
      url: "https://react.dev",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "React Quick Start",
      url: "https://react.dev/learn",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Thinking in React",
      url: "https://react.dev/learn/thinking-in-react",
      type: "tutorial",
      difficulty: "intermediate",
    },
    {
      title: "React Server Components",
      url: "https://react.dev/reference/rsc/server-components",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  vue: [
    {
      title: "Official Documentation",
      url: "https://vuejs.org/guide/introduction.html",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Vue Tutorial",
      url: "https://vuejs.org/tutorial/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Composition API In-Depth",
      url: "https://vuejs.org/guide/extras/composition-api-faq.html",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  svelte: [
    {
      title: "Official Documentation",
      url: "https://svelte.dev/docs",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Svelte Interactive Tutorial",
      url: "https://learn.svelte.dev/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "SvelteKit Documentation",
      url: "https://svelte.dev/docs/kit/introduction",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  express: [
    {
      title: "Official Documentation",
      url: "https://expressjs.com/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Getting Started Guide",
      url: "https://expressjs.com/en/starter/installing.html",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Advanced Routing",
      url: "https://expressjs.com/en/guide/routing.html",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  fastapi: [
    {
      title: "Official Documentation",
      url: "https://fastapi.tiangolo.com/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "FastAPI Tutorial",
      url: "https://fastapi.tiangolo.com/tutorial/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Advanced User Guide",
      url: "https://fastapi.tiangolo.com/advanced/",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  django: [
    {
      title: "Official Documentation",
      url: "https://docs.djangoproject.com/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Django Tutorial",
      url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Django REST Framework",
      url: "https://www.django-rest-framework.org/tutorial/quickstart/",
      type: "tutorial",
      difficulty: "intermediate",
    },
    {
      title: "Django Performance Optimization",
      url: "https://docs.djangoproject.com/en/stable/topics/performance/",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  nestjs: [
    {
      title: "Official Documentation",
      url: "https://docs.nestjs.com/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "First Steps",
      url: "https://docs.nestjs.com/first-steps",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Custom Decorators & Guards",
      url: "https://docs.nestjs.com/guards",
      type: "docs",
      difficulty: "intermediate",
    },
    {
      title: "Microservices",
      url: "https://docs.nestjs.com/microservices/basics",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  postgresql: [
    {
      title: "Official Documentation",
      url: "https://www.postgresql.org/docs/current/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "PostgreSQL Tutorial",
      url: "https://www.postgresql.org/docs/current/tutorial.html",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Performance Tips",
      url: "https://www.postgresql.org/docs/current/performance-tips.html",
      type: "docs",
      difficulty: "intermediate",
    },
    {
      title: "Indexing Best Practices",
      url: "https://www.postgresql.org/docs/current/indexes.html",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  mongodb: [
    {
      title: "Official Documentation",
      url: "https://www.mongodb.com/docs/manual/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "MongoDB University",
      url: "https://learn.mongodb.com/",
      type: "course",
      difficulty: "beginner",
    },
    {
      title: "Aggregation Pipeline",
      url: "https://www.mongodb.com/docs/manual/aggregation/",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  redis: [
    {
      title: "Official Documentation",
      url: "https://redis.io/docs/latest/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Redis University",
      url: "https://university.redis.io/",
      type: "course",
      difficulty: "beginner",
    },
    {
      title: "Data Structures In-Depth",
      url: "https://redis.io/docs/latest/develop/data-types/",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  prisma: [
    {
      title: "Official Documentation",
      url: "https://www.prisma.io/docs",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Quickstart",
      url: "https://www.prisma.io/docs/getting-started/quickstart",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Advanced Query Patterns",
      url: "https://www.prisma.io/docs/orm/prisma-client/queries",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  drizzle: [
    {
      title: "Official Documentation",
      url: "https://orm.drizzle.team/docs/overview",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Getting Started",
      url: "https://orm.drizzle.team/docs/get-started",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Joins & Relations",
      url: "https://orm.drizzle.team/docs/joins",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  tailwindcss: [
    {
      title: "Official Documentation",
      url: "https://tailwindcss.com/docs",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Installation Guide",
      url: "https://tailwindcss.com/docs/installation",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Customizing Your Theme",
      url: "https://tailwindcss.com/docs/theme",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  typescript: [
    {
      title: "Official Documentation",
      url: "https://www.typescriptlang.org/docs/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Advanced Types",
      url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
      type: "docs",
      difficulty: "intermediate",
    },
    {
      title: "Type Challenges",
      url: "https://github.com/type-challenges/type-challenges",
      type: "tutorial",
      difficulty: "advanced",
    },
  ],

  docker: [
    {
      title: "Official Documentation",
      url: "https://docs.docker.com/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Getting Started",
      url: "https://docs.docker.com/get-started/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Docker Compose",
      url: "https://docs.docker.com/compose/",
      type: "docs",
      difficulty: "intermediate",
    },
    {
      title: "Multi-Stage Builds",
      url: "https://docs.docker.com/build/building/multi-stage/",
      type: "docs",
      difficulty: "advanced",
    },
  ],

  vitest: [
    {
      title: "Official Documentation",
      url: "https://vitest.dev/guide/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Getting Started",
      url: "https://vitest.dev/guide/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Mocking",
      url: "https://vitest.dev/guide/mocking.html",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  git: [
    {
      title: "Official Documentation",
      url: "https://git-scm.com/doc",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Pro Git Book",
      url: "https://git-scm.com/book/en/v2",
      type: "book",
      difficulty: "beginner",
    },
    {
      title: "Interactive Branching Tutorial",
      url: "https://learngitbranching.js.org/",
      type: "tutorial",
      difficulty: "intermediate",
    },
  ],

  nginx: [
    {
      title: "Official Documentation",
      url: "https://nginx.org/en/docs/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Beginner's Guide",
      url: "https://nginx.org/en/docs/beginners_guide.html",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Reverse Proxy Configuration",
      url: "https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/",
      type: "docs",
      difficulty: "intermediate",
    },
  ],

  python: [
    {
      title: "Official Documentation",
      url: "https://docs.python.org/3/",
      type: "docs",
      difficulty: "beginner",
    },
    {
      title: "Python Tutorial",
      url: "https://docs.python.org/3/tutorial/",
      type: "tutorial",
      difficulty: "beginner",
    },
    {
      title: "Real Python Tutorials",
      url: "https://realpython.com/",
      type: "tutorial",
      difficulty: "intermediate",
    },
    {
      title: "Python Design Patterns",
      url: "https://python-patterns.guide/",
      type: "docs",
      difficulty: "advanced",
    },
  ],
};

/**
 * Get learning resources for a technology by its ID.
 * Returns undefined if no resources are available.
 */
export function getLearningResources(technologyId: string): LearningResource[] | undefined {
  return LEARNING_RESOURCES[technologyId];
}
