// This file is generated from the YAML registry at build time.
// Regenerate: node scripts/generate-data.mjs

export const technologies = [
  {
    "id": "clerk",
    "name": "Clerk",
    "category": "auth",
    "description": "Drop-in authentication and user management with prebuilt UI components and multi-tenant support",
    "website": "https://clerk.com",
    "versions": [
      {
        "version": "6.0"
      },
      {
        "version": "5.12",
        "lts": true
      },
      {
        "version": "4.29",
        "eol": "2025-01-01"
      }
    ],
    "defaultVersion": "6.0",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nextauth",
      "supabase-auth",
      "lucia"
    ],
    "suggestedWith": [
      "nextjs",
      "react"
    ],
    "officialScaffold": "npx create-next-app@latest --example with-clerk",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "/api/clerk/health",
      "interval": "30s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_test_your-key",
      "CLERK_SECRET_KEY": "sk_test_your-key"
    },
    "configFiles": [
      "middleware.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "auth",
      "clerk",
      "authentication",
      "user-management",
      "oauth",
      "sso",
      "multi-tenant"
    ]
  },
  {
    "id": "lucia",
    "name": "Lucia",
    "category": "auth",
    "description": "Simple and flexible auth library for TypeScript with session management",
    "website": "https://lucia-auth.com",
    "versions": [
      {
        "version": "3.2"
      },
      {
        "version": "3.1"
      }
    ],
    "defaultVersion": "3.2",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nextauth",
      "clerk",
      "supabase-auth"
    ],
    "suggestedWith": [
      "typescript",
      "prisma",
      "drizzle"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "package.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "lucia",
      "auth",
      "session",
      "typescript",
      "authentication"
    ]
  },
  {
    "id": "nextauth",
    "name": "NextAuth.js (Auth.js)",
    "category": "auth",
    "description": "Authentication library for Next.js with OAuth, credentials, and database session support",
    "website": "https://authjs.dev",
    "versions": [
      {
        "version": "5.0"
      },
      {
        "version": "4.24",
        "lts": true
      },
      {
        "version": "4.23"
      },
      {
        "version": "3.29",
        "eol": "2023-01-01"
      }
    ],
    "defaultVersion": "5.0",
    "requires": [
      "nodejs",
      "nextjs"
    ],
    "incompatibleWith": [
      "clerk",
      "supabase-auth",
      "lucia"
    ],
    "suggestedWith": [
      "prisma",
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "/api/auth/session",
      "interval": "30s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NEXTAUTH_SECRET": "your-secret-key",
      "NEXTAUTH_URL": "http://localhost:3000"
    },
    "configFiles": [
      "auth.ts",
      "[...nextauth].ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "auth",
      "nextauth",
      "authjs",
      "oauth",
      "jwt",
      "session",
      "authentication"
    ]
  },
  {
    "id": "supabase-auth",
    "name": "Supabase Auth",
    "category": "auth",
    "description": "Open-source authentication with row-level security, social logins, and magic links powered by GoTrue",
    "website": "https://supabase.com/auth",
    "versions": [
      {
        "version": "2.72"
      },
      {
        "version": "2.65",
        "lts": true
      },
      {
        "version": "1.0",
        "eol": "2024-01-01"
      }
    ],
    "defaultVersion": "2.72",
    "defaultPort": 54321,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nextauth",
      "clerk",
      "lucia"
    ],
    "suggestedWith": [
      "postgresql",
      "nextjs",
      "react"
    ],
    "officialScaffold": "npx create-next-app --example with-supabase",
    "dockerImage": "supabase/gotrue",
    "healthCheck": {
      "endpoint": "/auth/v1/health",
      "interval": "30s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NEXT_PUBLIC_SUPABASE_URL": "http://localhost:54321",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
      "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
    },
    "configFiles": [
      "supabase/config.toml",
      "lib/supabase.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "auth",
      "supabase",
      "authentication",
      "rls",
      "oauth",
      "magic-link",
      "open-source"
    ]
  },
  {
    "id": "django",
    "name": "Django",
    "category": "backend",
    "description": "High-level Python web framework",
    "website": "https://djangoproject.com",
    "versions": [
      {
        "version": "5.1"
      },
      {
        "version": "5.0"
      }
    ],
    "defaultVersion": "5.1",
    "defaultPort": 8000,
    "requires": [
      "python"
    ],
    "incompatibleWith": [
      "fastapi",
      "flask"
    ],
    "suggestedWith": [
      "postgresql"
    ],
    "officialScaffold": "django-admin startproject",
    "dockerImage": null,
    "envVars": {
      "DJANGO_SETTINGS_MODULE": "config.settings",
      "DEBUG": "True"
    },
    "configFiles": [
      "manage.py",
      "requirements.txt"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "django",
      "python",
      "fullstack",
      "batteries"
    ]
  },
  {
    "id": "echo",
    "name": "Echo",
    "category": "backend",
    "description": "High performance Go web framework",
    "website": "https://echo.labstack.com",
    "versions": [
      {
        "version": "4"
      }
    ],
    "defaultVersion": "4",
    "defaultPort": 8080,
    "requires": [
      "go"
    ],
    "incompatibleWith": [
      "gin"
    ],
    "suggestedWith": [
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "PORT": "8080"
    },
    "configFiles": [
      "go.mod"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "echo",
      "go",
      "api"
    ]
  },
  {
    "id": "express",
    "name": "Express",
    "category": "backend",
    "description": "Minimal Node.js web framework",
    "website": "https://expressjs.com",
    "versions": [
      {
        "version": "5"
      },
      {
        "version": "4"
      }
    ],
    "defaultVersion": "5",
    "defaultPort": 3001,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nestjs"
    ],
    "suggestedWith": [
      "typescript",
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "PORT": "3001"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "express",
      "nodejs",
      "api",
      "rest"
    ]
  },
  {
    "id": "fastapi",
    "name": "FastAPI",
    "category": "backend",
    "description": "Modern Python web framework with automatic API docs",
    "website": "https://fastapi.tiangolo.com",
    "versions": [
      {
        "version": "0.115"
      }
    ],
    "defaultVersion": "0.115",
    "defaultPort": 8000,
    "requires": [
      "python"
    ],
    "incompatibleWith": [
      "django",
      "flask"
    ],
    "suggestedWith": [
      "postgresql",
      "sqlalchemy",
      "redis"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "HOST": "0.0.0.0",
      "PORT": "8000"
    },
    "configFiles": [
      "requirements.txt",
      "pyproject.toml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "fastapi",
      "python",
      "api",
      "async"
    ]
  },
  {
    "id": "fastify",
    "name": "Fastify",
    "category": "backend",
    "description": "Fast and low overhead Node.js web framework",
    "website": "https://fastify.dev",
    "versions": [
      {
        "version": "5"
      },
      {
        "version": "4"
      }
    ],
    "defaultVersion": "5",
    "defaultPort": 3001,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nestjs"
    ],
    "suggestedWith": [
      "typescript",
      "postgresql",
      "prisma"
    ],
    "officialScaffold": "npx fastify-cli generate",
    "dockerImage": null,
    "envVars": {
      "PORT": "3001"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "fastify",
      "nodejs",
      "api",
      "fast"
    ]
  },
  {
    "id": "flask",
    "name": "Flask",
    "category": "backend",
    "description": "Lightweight Python web framework",
    "website": "https://flask.palletsprojects.com",
    "versions": [
      {
        "version": "3.1"
      },
      {
        "version": "3.0"
      }
    ],
    "defaultVersion": "3.1",
    "defaultPort": 5000,
    "requires": [
      "python"
    ],
    "incompatibleWith": [
      "fastapi",
      "django"
    ],
    "suggestedWith": [
      "postgresql",
      "sqlalchemy"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "FLASK_APP": "app",
      "FLASK_ENV": "development"
    },
    "configFiles": [
      "requirements.txt"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "flask",
      "python",
      "micro",
      "api"
    ]
  },
  {
    "id": "gin",
    "name": "Gin",
    "category": "backend",
    "description": "HTTP web framework for Go",
    "website": "https://gin-gonic.com",
    "versions": [
      {
        "version": "1.10"
      }
    ],
    "defaultVersion": "1.10",
    "defaultPort": 8080,
    "requires": [
      "go"
    ],
    "incompatibleWith": [
      "echo"
    ],
    "suggestedWith": [
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "GIN_MODE": "debug",
      "PORT": "8080"
    },
    "configFiles": [
      "go.mod"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "gin",
      "go",
      "api",
      "fast"
    ]
  },
  {
    "id": "hono",
    "name": "Hono",
    "category": "backend",
    "description": "Ultrafast web framework for the edge",
    "website": "https://hono.dev",
    "versions": [
      {
        "version": "4"
      }
    ],
    "defaultVersion": "4",
    "defaultPort": 3001,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript",
      "bun"
    ],
    "officialScaffold": "npm create hono@latest",
    "dockerImage": null,
    "envVars": {
      "PORT": "3001"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "hono",
      "edge",
      "api",
      "fast"
    ]
  },
  {
    "id": "laravel",
    "name": "Laravel",
    "category": "backend",
    "description": "PHP web application framework with expressive, elegant syntax",
    "website": "https://laravel.com",
    "versions": [
      {
        "version": "12"
      },
      {
        "version": "11",
        "lts": true
      }
    ],
    "defaultVersion": "12",
    "defaultPort": 8000,
    "requires": [
      "php"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "mysql",
      "redis",
      "nginx"
    ],
    "officialScaffold": "composer create-project laravel/laravel",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:8000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "APP_ENV": "local",
      "APP_DEBUG": "true",
      "APP_KEY": "",
      "DB_CONNECTION": "mysql"
    },
    "configFiles": [
      ".env",
      "composer.json",
      "artisan"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "laravel",
      "php",
      "backend",
      "framework",
      "mvc",
      "eloquent"
    ]
  },
  {
    "id": "nestjs",
    "name": "NestJS",
    "category": "backend",
    "description": "Progressive Node.js framework for building scalable server-side applications",
    "website": "https://nestjs.com",
    "versions": [
      {
        "version": "11"
      },
      {
        "version": "10",
        "lts": true
      }
    ],
    "defaultVersion": "11",
    "defaultPort": 3000,
    "requires": [
      "nodejs",
      "typescript"
    ],
    "incompatibleWith": [
      "express",
      "fastify"
    ],
    "suggestedWith": [
      "prisma",
      "postgresql"
    ],
    "officialScaffold": "npx @nestjs/cli new",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:3000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NODE_ENV": "development",
      "PORT": "3000"
    },
    "configFiles": [
      "nest-cli.json",
      "tsconfig.json",
      "package.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "nestjs",
      "nodejs",
      "typescript",
      "backend",
      "framework",
      "enterprise"
    ]
  },
  {
    "id": "spring-boot",
    "name": "Spring Boot",
    "category": "backend",
    "description": "Production-ready Java framework for building stand-alone Spring applications",
    "website": "https://spring.io/projects/spring-boot",
    "versions": [
      {
        "version": "3.4"
      },
      {
        "version": "3.3",
        "lts": true
      }
    ],
    "defaultVersion": "3.4",
    "defaultPort": 8080,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "postgresql",
      "redis"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:8080/actuator/health",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "SPRING_PROFILES_ACTIVE": "dev",
      "SERVER_PORT": "8080"
    },
    "configFiles": [
      "pom.xml",
      "application.properties",
      "application.yml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "spring-boot",
      "java",
      "backend",
      "framework",
      "enterprise",
      "jvm"
    ]
  },
  {
    "id": "trpc",
    "name": "tRPC",
    "category": "backend",
    "description": "End-to-end typesafe APIs made easy with TypeScript",
    "website": "https://trpc.io",
    "versions": [
      {
        "version": "11"
      },
      {
        "version": "10"
      }
    ],
    "defaultVersion": "11",
    "requires": [
      "nodejs",
      "typescript"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "nextjs",
      "react",
      "prisma"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "package.json",
      "tsconfig.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "trpc",
      "typescript",
      "api",
      "rpc",
      "typesafe",
      "fullstack"
    ]
  },
  {
    "id": "kafka",
    "name": "Apache Kafka",
    "category": "database",
    "description": "Distributed event streaming platform for high-throughput data pipelines",
    "website": "https://kafka.apache.org",
    "versions": [
      {
        "version": "3.9"
      },
      {
        "version": "3.8"
      }
    ],
    "defaultVersion": "3.9",
    "defaultPort": 9092,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "confluentinc/cp-kafka:7.8.0",
    "healthCheck": {
      "command": "kafka-broker-api-versions --bootstrap-server localhost:9092",
      "interval": "15s",
      "timeout": "10s",
      "retries": 5
    },
    "envVars": {
      "KAFKA_BROKER_ID": "1",
      "KAFKA_LISTENERS": "PLAINTEXT://0.0.0.0:9092",
      "KAFKA_ADVERTISED_LISTENERS": "PLAINTEXT://localhost:9092"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "kafka",
      "streaming",
      "event",
      "message-broker",
      "distributed",
      "queue"
    ]
  },
  {
    "id": "mariadb",
    "name": "MariaDB",
    "category": "database",
    "description": "Community-developed fork of MySQL with enhanced features and performance",
    "website": "https://mariadb.org",
    "versions": [
      {
        "version": "11.7"
      },
      {
        "version": "11.6",
        "lts": true
      }
    ],
    "defaultVersion": "11.7",
    "defaultPort": 3306,
    "requires": [],
    "incompatibleWith": [
      "mysql"
    ],
    "suggestedWith": [
      "prisma",
      "drizzle",
      "laravel"
    ],
    "officialScaffold": null,
    "dockerImage": "mariadb:11.7",
    "healthCheck": {
      "command": "mariadb-admin ping -u root",
      "interval": "10s",
      "timeout": "5s",
      "retries": 5
    },
    "envVars": {
      "MARIADB_ROOT_PASSWORD": "mariadb",
      "MARIADB_DATABASE": "app",
      "MARIADB_USER": "mariadb",
      "MARIADB_PASSWORD": "mariadb",
      "DATABASE_URL": "mysql://mariadb:mariadb@localhost:3306/app"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "mariadb",
      "mysql",
      "sql",
      "relational",
      "database"
    ]
  },
  {
    "id": "mongodb",
    "name": "MongoDB",
    "category": "database",
    "description": "Document-oriented NoSQL database",
    "website": "https://mongodb.com",
    "versions": [
      {
        "version": "8.0"
      },
      {
        "version": "7.0"
      }
    ],
    "defaultVersion": "8.0",
    "defaultPort": 27017,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "mongo:8.0",
    "healthCheck": {
      "command": "mongosh --eval \"db.adminCommand('ping')\"",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "MONGO_INITDB_ROOT_USERNAME": "admin",
      "MONGO_INITDB_ROOT_PASSWORD": "admin",
      "MONGODB_URL": "mongodb://admin:admin@localhost:27017/app?authSource=admin"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "mongodb",
      "nosql",
      "document"
    ]
  },
  {
    "id": "mysql",
    "name": "MySQL",
    "category": "database",
    "description": "Popular open source relational database",
    "website": "https://mysql.com",
    "versions": [
      {
        "version": "9.0"
      },
      {
        "version": "8.4"
      }
    ],
    "defaultVersion": "9.0",
    "defaultPort": 3306,
    "requires": [],
    "incompatibleWith": [
      "mariadb"
    ],
    "suggestedWith": [
      "prisma",
      "typeorm"
    ],
    "officialScaffold": null,
    "dockerImage": "mysql:9.0",
    "healthCheck": {
      "command": "mysqladmin ping -h localhost",
      "interval": "5s",
      "timeout": "5s",
      "retries": 5
    },
    "envVars": {
      "MYSQL_ROOT_PASSWORD": "root",
      "MYSQL_DATABASE": "app",
      "DATABASE_URL": "mysql://root:root@localhost:3306/app"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "mysql",
      "sql",
      "relational"
    ]
  },
  {
    "id": "neon",
    "name": "Neon",
    "category": "database",
    "description": "Serverless Postgres with branching, autoscaling, and bottomless storage",
    "website": "https://neon.tech",
    "versions": [
      {
        "version": "1"
      }
    ],
    "defaultVersion": "1",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "prisma",
      "drizzle",
      "nextjs"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "DATABASE_URL": "postgresql://...@ep-xxx.us-east-2.aws.neon.tech/neondb"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "neon",
      "postgresql",
      "serverless",
      "cloud",
      "database",
      "branching"
    ]
  },
  {
    "id": "pocketbase",
    "name": "PocketBase",
    "category": "database",
    "description": "Open source backend with embedded SQLite database, auth, and file storage",
    "website": "https://pocketbase.io",
    "versions": [
      {
        "version": "0.25"
      },
      {
        "version": "0.24"
      }
    ],
    "defaultVersion": "0.25",
    "defaultPort": 8090,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "svelte",
      "react"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:8090/api/health",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "pocketbase",
      "sqlite",
      "baas",
      "backend",
      "realtime",
      "auth"
    ]
  },
  {
    "id": "postgresql",
    "name": "PostgreSQL",
    "category": "database",
    "description": "Advanced open source relational database",
    "website": "https://postgresql.org",
    "versions": [
      {
        "version": "17"
      },
      {
        "version": "16",
        "lts": true
      }
    ],
    "defaultVersion": "17",
    "defaultPort": 5432,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "prisma",
      "drizzle",
      "sqlalchemy"
    ],
    "officialScaffold": null,
    "dockerImage": "postgres:17",
    "healthCheck": {
      "command": "pg_isready -U postgres",
      "interval": "5s",
      "timeout": "5s",
      "retries": 5
    },
    "envVars": {
      "POSTGRES_USER": "postgres",
      "POSTGRES_PASSWORD": "postgres",
      "POSTGRES_DB": "app",
      "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/app"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "postgresql",
      "postgres",
      "sql",
      "relational"
    ]
  },
  {
    "id": "redis",
    "name": "Redis",
    "category": "database",
    "description": "In-memory data store for caching, queues, and sessions",
    "website": "https://redis.io",
    "versions": [
      {
        "version": "7"
      }
    ],
    "defaultVersion": "7",
    "defaultPort": 6379,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "redis:7-alpine",
    "healthCheck": {
      "command": "redis-cli ping",
      "interval": "5s",
      "timeout": "5s",
      "retries": 5
    },
    "envVars": {
      "REDIS_URL": "redis://localhost:6379/0"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "redis",
      "cache",
      "queue",
      "sessions",
      "nosql"
    ]
  },
  {
    "id": "sqlite",
    "name": "SQLite",
    "category": "database",
    "description": "Self-contained, serverless SQL database engine",
    "website": "https://sqlite.org",
    "versions": [
      {
        "version": "3.47"
      },
      {
        "version": "3.46"
      }
    ],
    "defaultVersion": "3.47",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "prisma",
      "drizzle"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "DATABASE_URL": "file:./dev.db"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "sqlite",
      "sql",
      "embedded",
      "serverless",
      "database",
      "lightweight"
    ]
  },
  {
    "id": "supabase",
    "name": "Supabase",
    "category": "database",
    "description": "Open source Firebase alternative with PostgreSQL, auth, and realtime",
    "website": "https://supabase.com",
    "versions": [
      {
        "version": "2"
      }
    ],
    "defaultVersion": "2",
    "defaultPort": 54321,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "supabase-auth",
      "nextjs"
    ],
    "officialScaffold": null,
    "dockerImage": "supabase/postgres",
    "healthCheck": {
      "endpoint": "http://localhost:54321/rest/v1/",
      "interval": "10s",
      "timeout": "5s",
      "retries": 5
    },
    "envVars": {
      "SUPABASE_URL": "http://localhost:54321",
      "SUPABASE_ANON_KEY": "",
      "SUPABASE_SERVICE_ROLE_KEY": ""
    },
    "configFiles": [
      "supabase/config.toml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "supabase",
      "postgresql",
      "baas",
      "realtime",
      "auth",
      "storage"
    ]
  },
  {
    "id": "turso",
    "name": "Turso",
    "category": "database",
    "description": "Edge-hosted distributed SQLite database built on libSQL",
    "website": "https://turso.tech",
    "versions": [
      {
        "version": "1"
      }
    ],
    "defaultVersion": "1",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "drizzle",
      "nextjs"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "TURSO_DATABASE_URL": "libsql://...",
      "TURSO_AUTH_TOKEN": "..."
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "turso",
      "sqlite",
      "libsql",
      "edge",
      "serverless",
      "database"
    ]
  },
  {
    "id": "biome",
    "name": "Biome",
    "category": "devops",
    "description": "Fast formatter and linter for JavaScript, TypeScript, JSX, and JSON",
    "website": "https://biomejs.dev",
    "versions": [
      {
        "version": "1.9"
      },
      {
        "version": "1.8"
      },
      {
        "version": "1.7"
      }
    ],
    "defaultVersion": "1.9",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "eslint",
      "prettier"
    ],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "biome.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "biome",
      "linter",
      "formatter",
      "devops",
      "code-quality"
    ]
  },
  {
    "id": "cypress",
    "name": "Cypress",
    "category": "devops",
    "description": "JavaScript end-to-end testing framework for web applications",
    "website": "https://www.cypress.io",
    "versions": [
      {
        "version": "14.2"
      },
      {
        "version": "14.1"
      },
      {
        "version": "13.17"
      }
    ],
    "defaultVersion": "14.2",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "cypress.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "cypress",
      "testing",
      "e2e",
      "integration",
      "browser",
      "automation"
    ]
  },
  {
    "id": "devcontainers",
    "name": "Dev Containers",
    "category": "devops",
    "description": "Containerized development environments with consistent tooling and configuration",
    "website": "https://containers.dev",
    "versions": [
      {
        "version": "1"
      }
    ],
    "defaultVersion": "1",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "docker"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      ".devcontainer/devcontainer.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "devcontainers",
      "docker",
      "development",
      "environment",
      "vscode",
      "codespaces"
    ]
  },
  {
    "id": "docker",
    "name": "Docker",
    "category": "devops",
    "description": "Container platform for building, shipping, and running applications",
    "website": "https://www.docker.com",
    "versions": [
      {
        "version": "27"
      },
      {
        "version": "26"
      },
      {
        "version": "25"
      }
    ],
    "defaultVersion": "27",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "github-actions"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "Dockerfile",
      "docker-compose.yml",
      ".dockerignore"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "docker",
      "containers",
      "devops",
      "deployment"
    ]
  },
  {
    "id": "eslint",
    "name": "ESLint",
    "category": "devops",
    "description": "Pluggable linting utility for identifying and fixing problems in JavaScript code",
    "website": "https://eslint.org",
    "versions": [
      {
        "version": "9"
      },
      {
        "version": "8"
      }
    ],
    "defaultVersion": "9",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "biome"
    ],
    "suggestedWith": [
      "prettier",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "eslint.config.js"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "eslint",
      "linter",
      "code-quality",
      "devops"
    ]
  },
  {
    "id": "github-actions",
    "name": "GitHub Actions",
    "category": "devops",
    "description": "CI/CD platform integrated with GitHub for automating build, test, and deploy workflows",
    "website": "https://github.com/features/actions",
    "versions": [
      {
        "version": "3"
      },
      {
        "version": "2"
      }
    ],
    "defaultVersion": "3",
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "docker"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      ".github/workflows/ci.yml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "github-actions",
      "ci",
      "cd",
      "automation",
      "devops"
    ]
  },
  {
    "id": "jest",
    "name": "Jest",
    "category": "devops",
    "description": "Delightful JavaScript testing framework with a focus on simplicity",
    "website": "https://jestjs.io",
    "versions": [
      {
        "version": "30"
      },
      {
        "version": "29"
      },
      {
        "version": "28"
      }
    ],
    "defaultVersion": "30",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "vitest"
    ],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "jest.config.ts",
      "jest.config.js"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "jest",
      "testing",
      "unit-testing",
      "devops"
    ]
  },
  {
    "id": "playwright",
    "name": "Playwright",
    "category": "devops",
    "description": "End-to-end testing framework for modern web apps across all browsers",
    "website": "https://playwright.dev",
    "versions": [
      {
        "version": "1.51"
      },
      {
        "version": "1.50"
      },
      {
        "version": "1.49"
      }
    ],
    "defaultVersion": "1.51",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": "npm init playwright@latest",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "playwright.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "playwright",
      "testing",
      "e2e",
      "browser",
      "devops"
    ]
  },
  {
    "id": "pnpm",
    "name": "pnpm",
    "category": "devops",
    "description": "Fast, disk space efficient package manager for Node.js",
    "website": "https://pnpm.io",
    "versions": [
      {
        "version": "10"
      },
      {
        "version": "9",
        "lts": true
      },
      {
        "version": "8"
      }
    ],
    "defaultVersion": "9",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "pnpm-workspace.yaml",
      ".npmrc"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "pnpm",
      "package-manager",
      "monorepo",
      "nodejs"
    ]
  },
  {
    "id": "prettier",
    "name": "Prettier",
    "category": "devops",
    "description": "Opinionated code formatter supporting many languages and integrations",
    "website": "https://prettier.io",
    "versions": [
      {
        "version": "3.5"
      },
      {
        "version": "3.4"
      },
      {
        "version": "3.3"
      }
    ],
    "defaultVersion": "3.5",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "biome"
    ],
    "suggestedWith": [
      "eslint",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      ".prettierrc"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "prettier",
      "formatter",
      "code-quality",
      "devops"
    ]
  },
  {
    "id": "storybook",
    "name": "Storybook",
    "category": "devops",
    "description": "UI development workshop for building and testing components in isolation",
    "website": "https://storybook.js.org",
    "versions": [
      {
        "version": "8.6"
      },
      {
        "version": "8.5"
      },
      {
        "version": "7.6",
        "eol": "2025-06-30"
      }
    ],
    "defaultVersion": "8.6",
    "defaultPort": 6006,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "react",
      "vue",
      "svelte",
      "angular"
    ],
    "officialScaffold": "npx storybook@latest init",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:6006",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [
      ".storybook/main.ts",
      ".storybook/preview.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "storybook",
      "ui",
      "components",
      "testing",
      "documentation",
      "development"
    ]
  },
  {
    "id": "turborepo",
    "name": "Turborepo",
    "category": "devops",
    "description": "High-performance build system for JavaScript and TypeScript monorepos",
    "website": "https://turbo.build",
    "versions": [
      {
        "version": "2.8"
      },
      {
        "version": "2.7"
      }
    ],
    "defaultVersion": "2.8",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "pnpm",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "turbo.json",
      "package.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "turborepo",
      "monorepo",
      "build",
      "caching",
      "pipeline",
      "devops"
    ]
  },
  {
    "id": "typescript",
    "name": "TypeScript",
    "category": "devops",
    "description": "Strongly typed programming language that builds on JavaScript",
    "website": "https://www.typescriptlang.org",
    "versions": [
      {
        "version": "5.8"
      },
      {
        "version": "5.7"
      },
      {
        "version": "5.6"
      },
      {
        "version": "5.5"
      }
    ],
    "defaultVersion": "5.8",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "vitest",
      "biome"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "tsconfig.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "typescript",
      "types",
      "language",
      "devops"
    ]
  },
  {
    "id": "vitest",
    "name": "Vitest",
    "category": "devops",
    "description": "Fast Vite-native unit test framework for modern JavaScript projects",
    "website": "https://vitest.dev",
    "versions": [
      {
        "version": "3.1"
      },
      {
        "version": "3.0"
      },
      {
        "version": "2.1"
      },
      {
        "version": "1.6"
      }
    ],
    "defaultVersion": "3.1",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "jest"
    ],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "vitest.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "vitest",
      "testing",
      "unit-testing",
      "vite",
      "devops"
    ]
  },
  {
    "id": "zod",
    "name": "Zod",
    "category": "devops",
    "description": "TypeScript-first schema declaration and validation library",
    "website": "https://zod.dev",
    "versions": [
      {
        "version": "3.24"
      },
      {
        "version": "3.23"
      }
    ],
    "defaultVersion": "3.24",
    "requires": [
      "nodejs",
      "typescript"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "trpc",
      "nextjs",
      "react"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "zod",
      "validation",
      "schema",
      "typescript",
      "parsing",
      "typesafe"
    ]
  },
  {
    "id": "angular",
    "name": "Angular",
    "category": "frontend",
    "description": "Platform for building web applications",
    "website": "https://angular.dev",
    "versions": [
      {
        "version": "19"
      },
      {
        "version": "18"
      }
    ],
    "defaultVersion": "19",
    "defaultPort": 4200,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "nextjs",
      "nuxt",
      "sveltekit",
      "qwik",
      "solidjs"
    ],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": "npx @angular/cli new",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "angular.json",
      "tsconfig.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "angular",
      "frontend",
      "enterprise",
      "spa"
    ]
  },
  {
    "id": "astro",
    "name": "Astro",
    "category": "frontend",
    "description": "Content-focused web framework with island architecture",
    "website": "https://astro.build",
    "versions": [
      {
        "version": "5"
      },
      {
        "version": "4"
      }
    ],
    "defaultVersion": "5",
    "defaultPort": 4321,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "remix"
    ],
    "suggestedWith": [
      "tailwindcss",
      "typescript"
    ],
    "officialScaffold": "npm create astro@latest",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "astro.config.mjs"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "astro",
      "static",
      "islands",
      "content"
    ]
  },
  {
    "id": "htmx",
    "name": "HTMX",
    "category": "frontend",
    "description": "High power tools for HTML — access modern browser features directly from HTML",
    "website": "https://htmx.org",
    "versions": [
      {
        "version": "2.0"
      },
      {
        "version": "1.9"
      }
    ],
    "defaultVersion": "2.0",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "tailwindcss"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "htmx",
      "html",
      "hypermedia",
      "frontend",
      "progressive-enhancement"
    ]
  },
  {
    "id": "nextjs",
    "name": "Next.js",
    "category": "frontend",
    "description": "Full-stack React framework with SSR, SSG, and API routes",
    "website": "https://nextjs.org",
    "versions": [
      {
        "version": "15"
      },
      {
        "version": "14"
      }
    ],
    "defaultVersion": "15",
    "defaultPort": 3000,
    "requires": [
      "nodejs",
      "react"
    ],
    "incompatibleWith": [
      "nuxt",
      "sveltekit",
      "angular",
      "remix"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss",
      "prisma"
    ],
    "officialScaffold": "npx create-next-app@latest",
    "dockerImage": null,
    "envVars": {
      "NEXT_PUBLIC_API_URL": "http://localhost:8000"
    },
    "configFiles": [
      "next.config.js",
      "tsconfig.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "nextjs",
      "react",
      "ssr",
      "fullstack",
      "frontend"
    ]
  },
  {
    "id": "nuxt",
    "name": "Nuxt",
    "category": "frontend",
    "description": "Full-stack Vue framework",
    "website": "https://nuxt.com",
    "versions": [
      {
        "version": "3"
      }
    ],
    "defaultVersion": "3",
    "defaultPort": 3000,
    "requires": [
      "nodejs",
      "vue"
    ],
    "incompatibleWith": [
      "nextjs",
      "sveltekit",
      "angular",
      "remix"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": "npx nuxi init",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "nuxt.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "nuxt",
      "vue",
      "ssr",
      "fullstack"
    ]
  },
  {
    "id": "qwik",
    "name": "Qwik",
    "category": "frontend",
    "description": "Instant-loading web framework with resumability and fine-grained lazy loading",
    "website": "https://qwik.dev",
    "versions": [
      {
        "version": "1.12"
      },
      {
        "version": "1.11"
      }
    ],
    "defaultVersion": "1.12",
    "defaultPort": 5173,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "react",
      "vue",
      "svelte",
      "angular"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": "npm create qwik@latest",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:5173",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NODE_ENV": "development"
    },
    "configFiles": [
      "package.json",
      "tsconfig.json",
      "vite.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "qwik",
      "resumable",
      "frontend",
      "framework",
      "performance"
    ]
  },
  {
    "id": "react",
    "name": "React",
    "category": "frontend",
    "description": "Library for building user interfaces",
    "website": "https://react.dev",
    "versions": [
      {
        "version": "19"
      },
      {
        "version": "18"
      }
    ],
    "defaultVersion": "19",
    "defaultPort": 3000,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "qwik",
      "solidjs"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "react",
      "frontend",
      "ui",
      "spa"
    ]
  },
  {
    "id": "remix",
    "name": "Remix",
    "category": "frontend",
    "description": "Full stack web framework focused on web standards and modern UX",
    "website": "https://remix.run",
    "versions": [
      {
        "version": "2.15"
      },
      {
        "version": "2.14"
      }
    ],
    "defaultVersion": "2.15",
    "defaultPort": 3000,
    "requires": [
      "nodejs",
      "react"
    ],
    "incompatibleWith": [
      "nextjs",
      "nuxt",
      "sveltekit",
      "astro"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss",
      "prisma"
    ],
    "officialScaffold": "npx create-remix@latest",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:3000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NODE_ENV": "development",
      "PORT": "3000"
    },
    "configFiles": [
      "remix.config.js",
      "package.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "remix",
      "react",
      "fullstack",
      "framework",
      "ssr",
      "web-standards"
    ]
  },
  {
    "id": "solidjs",
    "name": "Solid.js",
    "category": "frontend",
    "description": "Declarative, efficient, and flexible JavaScript library for building UIs",
    "website": "https://www.solidjs.com",
    "versions": [
      {
        "version": "1.9"
      },
      {
        "version": "1.8"
      }
    ],
    "defaultVersion": "1.9",
    "defaultPort": 3000,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "react",
      "vue",
      "svelte",
      "angular"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": "npx degit solidjs/templates/ts",
    "dockerImage": null,
    "healthCheck": {
      "endpoint": "http://localhost:3000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NODE_ENV": "development",
      "PORT": "3000"
    },
    "configFiles": [
      "package.json",
      "tsconfig.json",
      "vite.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "solidjs",
      "reactive",
      "frontend",
      "ui",
      "signals"
    ]
  },
  {
    "id": "svelte",
    "name": "Svelte",
    "category": "frontend",
    "description": "Compile-time UI framework",
    "website": "https://svelte.dev",
    "versions": [
      {
        "version": "5"
      },
      {
        "version": "4"
      }
    ],
    "defaultVersion": "5",
    "defaultPort": 5173,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "qwik",
      "solidjs"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "svelte.config.js"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "svelte",
      "frontend",
      "compiler"
    ]
  },
  {
    "id": "sveltekit",
    "name": "SvelteKit",
    "category": "frontend",
    "description": "Full-stack Svelte framework",
    "website": "https://svelte.dev/docs/kit",
    "versions": [
      {
        "version": "2"
      }
    ],
    "defaultVersion": "2",
    "defaultPort": 5173,
    "requires": [
      "nodejs",
      "svelte"
    ],
    "incompatibleWith": [
      "nextjs",
      "nuxt",
      "angular",
      "remix"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss",
      "prisma"
    ],
    "officialScaffold": "npx sv create",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "svelte.config.js",
      "vite.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "sveltekit",
      "svelte",
      "ssr",
      "fullstack"
    ]
  },
  {
    "id": "vue",
    "name": "Vue.js",
    "category": "frontend",
    "description": "Progressive JavaScript framework",
    "website": "https://vuejs.org",
    "versions": [
      {
        "version": "3"
      }
    ],
    "defaultVersion": "3",
    "defaultPort": 5173,
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "qwik",
      "solidjs"
    ],
    "suggestedWith": [
      "typescript",
      "tailwindcss"
    ],
    "officialScaffold": "npm create vue@latest",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "vite.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "vue",
      "frontend",
      "spa"
    ]
  },
  {
    "id": "django-orm",
    "name": "Django ORM",
    "category": "orm",
    "description": "Built-in ORM for Django with migrations, querysets, and model relationships",
    "website": "https://docs.djangoproject.com/en/5.1/topics/db/",
    "versions": [
      {
        "version": "5.1"
      },
      {
        "version": "5.0"
      },
      {
        "version": "4.2",
        "lts": true
      }
    ],
    "defaultVersion": "5.1",
    "requires": [
      "python",
      "django"
    ],
    "incompatibleWith": [
      "sqlalchemy"
    ],
    "suggestedWith": [
      "postgresql",
      "mysql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "models.py"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "django",
      "orm",
      "python",
      "models",
      "migrations",
      "querysets"
    ]
  },
  {
    "id": "drizzle",
    "name": "Drizzle ORM",
    "category": "orm",
    "description": "Lightweight TypeScript ORM with SQL-like syntax and zero dependencies",
    "website": "https://orm.drizzle.team",
    "versions": [
      {
        "version": "0.40"
      },
      {
        "version": "0.39"
      },
      {
        "version": "0.38"
      },
      {
        "version": "0.37"
      }
    ],
    "defaultVersion": "0.40",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "typeorm",
      "prisma",
      "mongoose"
    ],
    "suggestedWith": [
      "postgresql",
      "typescript"
    ],
    "officialScaffold": "npx drizzle-kit init",
    "dockerImage": null,
    "healthCheck": {
      "command": "npx drizzle-kit check"
    },
    "envVars": {
      "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/app"
    },
    "configFiles": [
      "drizzle.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "drizzle",
      "orm",
      "typescript",
      "database",
      "migrations",
      "sql",
      "lightweight"
    ]
  },
  {
    "id": "mongoose",
    "name": "Mongoose",
    "category": "orm",
    "description": "Elegant MongoDB object modeling for Node.js with schema validation",
    "website": "https://mongoosejs.com",
    "versions": [
      {
        "version": "8.10"
      },
      {
        "version": "8.9"
      },
      {
        "version": "7.8",
        "eol": "2025-12-31"
      }
    ],
    "defaultVersion": "8.10",
    "requires": [
      "nodejs",
      "mongodb"
    ],
    "incompatibleWith": [
      "prisma",
      "drizzle",
      "typeorm"
    ],
    "suggestedWith": [
      "express",
      "fastify",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {
      "MONGODB_URI": "mongodb://localhost:27017/app"
    },
    "configFiles": [
      "package.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "mongoose",
      "mongodb",
      "odm",
      "nodejs",
      "schema",
      "models"
    ]
  },
  {
    "id": "prisma",
    "name": "Prisma ORM",
    "category": "orm",
    "description": "Next-generation Node.js and TypeScript ORM with auto-generated query builder and migrations",
    "website": "https://www.prisma.io",
    "versions": [
      {
        "version": "6.5",
        "lts": true
      },
      {
        "version": "6.4"
      },
      {
        "version": "5.22"
      },
      {
        "version": "5.21"
      }
    ],
    "defaultVersion": "6.5",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "typeorm",
      "drizzle",
      "mongoose"
    ],
    "suggestedWith": [
      "postgresql",
      "nextjs",
      "typescript"
    ],
    "officialScaffold": "npx prisma init",
    "dockerImage": null,
    "healthCheck": {
      "command": "npx prisma db execute --stdin <<< \"SELECT 1\""
    },
    "envVars": {
      "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/app"
    },
    "configFiles": [
      "prisma/schema.prisma"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "prisma",
      "orm",
      "typescript",
      "database",
      "migrations",
      "query-builder"
    ]
  },
  {
    "id": "sqlalchemy",
    "name": "SQLAlchemy",
    "category": "orm",
    "description": "The Python SQL toolkit and Object Relational Mapper for full database access",
    "website": "https://www.sqlalchemy.org",
    "versions": [
      {
        "version": "2.0",
        "lts": true
      },
      {
        "version": "1.4"
      }
    ],
    "defaultVersion": "2.0",
    "requires": [
      "python"
    ],
    "incompatibleWith": [
      "django-orm"
    ],
    "suggestedWith": [
      "fastapi",
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "healthCheck": {
      "command": "python -c \"from sqlalchemy import create_engine; engine = create_engine('${DATABASE_URL}'); engine.connect()\""
    },
    "envVars": {
      "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/app"
    },
    "configFiles": [
      "alembic.ini",
      "alembic/"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "sqlalchemy",
      "orm",
      "python",
      "database",
      "migrations",
      "alembic",
      "sql"
    ]
  },
  {
    "id": "typeorm",
    "name": "TypeORM",
    "category": "orm",
    "description": "ORM for TypeScript and JavaScript with Active Record and Data Mapper patterns",
    "website": "https://typeorm.io",
    "versions": [
      {
        "version": "0.3",
        "lts": true
      },
      {
        "version": "0.2"
      }
    ],
    "defaultVersion": "0.3",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [
      "prisma",
      "drizzle",
      "mongoose"
    ],
    "suggestedWith": [
      "postgresql",
      "typescript"
    ],
    "officialScaffold": "npx typeorm init",
    "dockerImage": null,
    "healthCheck": {
      "command": "npx ts-node -e \"import { DataSource } from 'typeorm'; new DataSource({type:'postgres',url:process.env.DATABASE_URL}).initialize()\""
    },
    "envVars": {
      "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/app"
    },
    "configFiles": [
      "ormconfig.json",
      "data-source.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "typeorm",
      "orm",
      "typescript",
      "database",
      "migrations",
      "active-record",
      "data-mapper"
    ]
  },
  {
    "id": "bun",
    "name": "Bun",
    "category": "runtime",
    "description": "Fast all-in-one JavaScript runtime and toolkit",
    "website": "https://bun.sh",
    "versions": [
      {
        "version": "1.2"
      },
      {
        "version": "1.1"
      }
    ],
    "defaultVersion": "1.2",
    "defaultPort": 3000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": "bun init",
    "dockerImage": "oven/bun:1.2",
    "healthCheck": {
      "endpoint": "http://localhost:3000"
    },
    "envVars": {
      "BUN_ENV": "development"
    },
    "configFiles": [
      "package.json",
      "bunfig.toml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "javascript",
      "typescript",
      "runtime",
      "fast"
    ]
  },
  {
    "id": "deno",
    "name": "Deno",
    "category": "runtime",
    "description": "Secure runtime for JavaScript and TypeScript with built-in tooling",
    "website": "https://deno.land",
    "versions": [
      {
        "version": "2.2"
      },
      {
        "version": "2.1"
      },
      {
        "version": "1.46",
        "eol": "2025-12-31"
      }
    ],
    "defaultVersion": "2.2",
    "defaultPort": 8000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": "denoland/deno:2.2.0",
    "healthCheck": {
      "endpoint": "http://localhost:8000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "DENO_ENV": "development",
      "PORT": "8000"
    },
    "configFiles": [
      "deno.json",
      "deno.lock"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "deno",
      "javascript",
      "typescript",
      "runtime",
      "server",
      "secure"
    ]
  },
  {
    "id": "go",
    "name": "Go",
    "category": "runtime",
    "description": "Statically typed, compiled language by Google",
    "website": "https://go.dev",
    "versions": [
      {
        "version": "1.23"
      },
      {
        "version": "1.22"
      }
    ],
    "defaultVersion": "1.23",
    "defaultPort": 8080,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "golang:1.23-alpine",
    "healthCheck": {
      "endpoint": "http://localhost:8080/health",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "GO_ENV": "development"
    },
    "configFiles": [
      "go.mod",
      "go.sum"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "go",
      "golang",
      "runtime",
      "compiled"
    ]
  },
  {
    "id": "nodejs",
    "name": "Node.js",
    "category": "runtime",
    "description": "JavaScript runtime built on V8",
    "website": "https://nodejs.org",
    "versions": [
      {
        "version": "24"
      },
      {
        "version": "22",
        "lts": true
      },
      {
        "version": "20",
        "lts": true
      }
    ],
    "defaultVersion": "22",
    "defaultPort": 3000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": "node:22-alpine",
    "healthCheck": {
      "endpoint": "http://localhost:3000",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "NODE_ENV": "development",
      "PORT": "3000"
    },
    "configFiles": [
      "package.json",
      "tsconfig.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "javascript",
      "typescript",
      "runtime",
      "server"
    ]
  },
  {
    "id": "php",
    "name": "PHP",
    "category": "runtime",
    "description": "Popular general-purpose scripting language suited for web development",
    "website": "https://www.php.net",
    "versions": [
      {
        "version": "8.4"
      },
      {
        "version": "8.3",
        "lts": true
      },
      {
        "version": "8.2",
        "eol": "2025-12-31"
      }
    ],
    "defaultVersion": "8.4",
    "defaultPort": 9000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "laravel",
      "nginx"
    ],
    "officialScaffold": null,
    "dockerImage": "php:8.4-fpm",
    "healthCheck": {
      "command": "php -r \"echo 'ok';\"",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "PHP_ENV": "development"
    },
    "configFiles": [
      "php.ini",
      "composer.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "php",
      "scripting",
      "web",
      "server",
      "runtime"
    ]
  },
  {
    "id": "python",
    "name": "Python",
    "category": "runtime",
    "description": "General-purpose programming language",
    "website": "https://python.org",
    "versions": [
      {
        "version": "3.13"
      },
      {
        "version": "3.12",
        "lts": true
      },
      {
        "version": "3.11"
      }
    ],
    "defaultVersion": "3.12",
    "defaultPort": 8000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "python:3.12-slim",
    "healthCheck": {
      "endpoint": "http://localhost:8000/health",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "PYTHONUNBUFFERED": "1",
      "PYTHON_ENV": "development"
    },
    "configFiles": [
      "pyproject.toml",
      "requirements.txt"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "python",
      "runtime",
      "server",
      "scripting"
    ]
  },
  {
    "id": "rust",
    "name": "Rust",
    "category": "runtime",
    "description": "Systems programming language focused on safety and performance",
    "website": "https://www.rust-lang.org",
    "versions": [
      {
        "version": "1.84"
      },
      {
        "version": "1.83"
      }
    ],
    "defaultVersion": "1.84",
    "defaultPort": 8080,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": "cargo init",
    "dockerImage": "rust:1.84-slim",
    "healthCheck": {
      "endpoint": "http://localhost:8080/health"
    },
    "envVars": {},
    "configFiles": [
      "Cargo.toml",
      "Cargo.lock"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "rust",
      "runtime",
      "compiled",
      "systems"
    ]
  },
  {
    "id": "adminer",
    "name": "Adminer",
    "category": "service",
    "description": "Full-featured database management tool in a single PHP file",
    "website": "https://www.adminer.org",
    "versions": [
      {
        "version": "4.8"
      }
    ],
    "defaultVersion": "4.8",
    "defaultPort": 8080,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "postgresql",
      "mysql",
      "mariadb"
    ],
    "officialScaffold": null,
    "dockerImage": "adminer:4",
    "healthCheck": {
      "endpoint": "http://localhost:8080",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "ADMINER_DEFAULT_SERVER": "localhost"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "adminer",
      "database",
      "management",
      "gui",
      "sql",
      "php"
    ]
  },
  {
    "id": "grafana",
    "name": "Grafana",
    "category": "service",
    "description": "Open source analytics and interactive visualization platform",
    "website": "https://grafana.com",
    "versions": [
      {
        "version": "11.5"
      },
      {
        "version": "11.4"
      },
      {
        "version": "10.4",
        "lts": true
      }
    ],
    "defaultVersion": "11.5",
    "defaultPort": 3001,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "prometheus"
    ],
    "officialScaffold": null,
    "dockerImage": "grafana/grafana:11.5.0",
    "healthCheck": {
      "endpoint": "http://localhost:3001/api/health",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "GF_SECURITY_ADMIN_USER": "admin",
      "GF_SECURITY_ADMIN_PASSWORD": "admin"
    },
    "configFiles": [
      "grafana.ini"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "grafana",
      "monitoring",
      "visualization",
      "dashboards",
      "observability"
    ]
  },
  {
    "id": "mailpit",
    "name": "Mailpit",
    "category": "service",
    "description": "Email and SMTP testing tool for developers with web UI",
    "website": "https://mailpit.axllent.org",
    "versions": [
      {
        "version": "1.21"
      },
      {
        "version": "1.20"
      },
      {
        "version": "1.19"
      }
    ],
    "defaultVersion": "1.21",
    "defaultPort": 8025,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "axllent/mailpit:latest",
    "healthCheck": {
      "endpoint": "http://localhost:8025",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "SMTP_HOST": "localhost",
      "SMTP_PORT": "1025"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "mailpit",
      "email",
      "smtp",
      "testing",
      "development",
      "mail-catcher"
    ]
  },
  {
    "id": "minio",
    "name": "MinIO",
    "category": "service",
    "description": "High-performance S3-compatible object storage",
    "website": "https://min.io",
    "versions": [
      {
        "version": "2024.12"
      },
      {
        "version": "2024.11"
      },
      {
        "version": "2024.10"
      }
    ],
    "defaultVersion": "2024.12",
    "defaultPort": 9000,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "minio/minio:latest",
    "healthCheck": {
      "endpoint": "http://localhost:9000/minio/health/live",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "MINIO_ROOT_USER": "minioadmin",
      "MINIO_ROOT_PASSWORD": "minioadmin",
      "S3_ENDPOINT": "http://localhost:9000"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "minio",
      "s3",
      "object-storage",
      "storage",
      "aws-s3-compatible"
    ]
  },
  {
    "id": "nginx",
    "name": "Nginx",
    "category": "service",
    "description": "High-performance HTTP server, reverse proxy, and load balancer",
    "website": "https://nginx.org",
    "versions": [
      {
        "version": "1.27"
      },
      {
        "version": "1.26",
        "lts": true
      },
      {
        "version": "1.25"
      }
    ],
    "defaultVersion": "1.27",
    "defaultPort": 80,
    "requires": [],
    "incompatibleWith": [
      "traefik"
    ],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "nginx:alpine",
    "healthCheck": {
      "endpoint": "http://localhost:80",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [
      "nginx.conf"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "nginx",
      "reverse-proxy",
      "web-server",
      "load-balancer",
      "http"
    ]
  },
  {
    "id": "pgadmin",
    "name": "pgAdmin",
    "category": "service",
    "description": "Feature-rich administration and development platform for PostgreSQL",
    "website": "https://www.pgadmin.org",
    "versions": [
      {
        "version": "8.16"
      },
      {
        "version": "8.15"
      }
    ],
    "defaultVersion": "8.16",
    "defaultPort": 5050,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "postgresql"
    ],
    "officialScaffold": null,
    "dockerImage": "dpage/pgadmin4:8.16",
    "healthCheck": {
      "endpoint": "http://localhost:5050/misc/ping",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {
      "PGADMIN_DEFAULT_EMAIL": "admin@admin.com",
      "PGADMIN_DEFAULT_PASSWORD": "admin"
    },
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "pgadmin",
      "postgresql",
      "database",
      "management",
      "gui",
      "admin"
    ]
  },
  {
    "id": "portainer",
    "name": "Portainer",
    "category": "service",
    "description": "Universal container management platform for Docker and Kubernetes",
    "website": "https://www.portainer.io",
    "versions": [
      {
        "version": "2.25"
      },
      {
        "version": "2.24"
      }
    ],
    "defaultVersion": "2.25",
    "defaultPort": 9443,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "docker"
    ],
    "officialScaffold": null,
    "dockerImage": "portainer/portainer-ce:2.25.0",
    "healthCheck": {
      "endpoint": "http://localhost:9000/api/system/status",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "portainer",
      "docker",
      "containers",
      "management",
      "gui",
      "kubernetes"
    ]
  },
  {
    "id": "prometheus",
    "name": "Prometheus",
    "category": "service",
    "description": "Open source monitoring and alerting toolkit with time series database",
    "website": "https://prometheus.io",
    "versions": [
      {
        "version": "3.2"
      },
      {
        "version": "3.1"
      },
      {
        "version": "2.55",
        "lts": true
      }
    ],
    "defaultVersion": "3.2",
    "defaultPort": 9090,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [
      "grafana"
    ],
    "officialScaffold": null,
    "dockerImage": "prom/prometheus:v3.2.0",
    "healthCheck": {
      "endpoint": "http://localhost:9090/-/healthy",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [
      "prometheus.yml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "prometheus",
      "monitoring",
      "metrics",
      "alerting",
      "time-series",
      "observability"
    ]
  },
  {
    "id": "rabbitmq",
    "name": "RabbitMQ",
    "category": "service",
    "description": "Open-source message broker for reliable asynchronous messaging",
    "website": "https://www.rabbitmq.com",
    "versions": [
      {
        "version": "4.0",
        "lts": true
      },
      {
        "version": "3.13"
      },
      {
        "version": "3.12",
        "eol": "2025-12-31"
      }
    ],
    "defaultVersion": "4.0",
    "defaultPort": 5672,
    "requires": [],
    "incompatibleWith": [],
    "suggestedWith": [],
    "officialScaffold": null,
    "dockerImage": "rabbitmq:3-management",
    "healthCheck": {
      "command": "rabbitmq-diagnostics -q ping",
      "interval": "10s",
      "timeout": "10s",
      "retries": 5
    },
    "envVars": {
      "RABBITMQ_DEFAULT_USER": "guest",
      "RABBITMQ_DEFAULT_PASS": "guest",
      "AMQP_URL": "amqp://guest:guest@localhost:5672"
    },
    "configFiles": [
      "rabbitmq.conf"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "rabbitmq",
      "message-broker",
      "amqp",
      "queue",
      "messaging",
      "async"
    ]
  },
  {
    "id": "traefik",
    "name": "Traefik",
    "category": "service",
    "description": "Cloud-native reverse proxy and load balancer with automatic service discovery",
    "website": "https://traefik.io",
    "versions": [
      {
        "version": "3.3"
      },
      {
        "version": "3.2"
      },
      {
        "version": "2.11",
        "lts": true
      }
    ],
    "defaultVersion": "3.3",
    "defaultPort": 80,
    "requires": [],
    "incompatibleWith": [
      "nginx"
    ],
    "suggestedWith": [
      "docker"
    ],
    "officialScaffold": null,
    "dockerImage": "traefik:v3.3",
    "healthCheck": {
      "endpoint": "http://localhost:8080/ping",
      "interval": "10s",
      "timeout": "5s",
      "retries": 3
    },
    "envVars": {},
    "configFiles": [
      "traefik.yml",
      "traefik.toml"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "traefik",
      "reverse-proxy",
      "load-balancer",
      "ingress",
      "docker",
      "cloud-native"
    ]
  },
  {
    "id": "chakra-ui",
    "name": "Chakra UI",
    "category": "styling",
    "description": "Simple, modular and accessible component library for React applications",
    "website": "https://chakra-ui.com",
    "versions": [
      {
        "version": "3.3"
      },
      {
        "version": "3.2"
      },
      {
        "version": "3.1"
      },
      {
        "version": "3.0"
      },
      {
        "version": "2.10"
      }
    ],
    "defaultVersion": "3.3",
    "requires": [
      "nodejs",
      "react"
    ],
    "incompatibleWith": [
      "shadcn-ui",
      "material-ui"
    ],
    "suggestedWith": [
      "nextjs",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "theme.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "chakra",
      "ui",
      "components",
      "accessible",
      "styling"
    ]
  },
  {
    "id": "css-modules",
    "name": "CSS Modules",
    "category": "styling",
    "description": "Locally scoped CSS classes for component-based styling",
    "website": "https://github.com/css-modules/css-modules",
    "versions": [
      {
        "version": "1"
      }
    ],
    "defaultVersion": "1",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "react",
      "vue",
      "nextjs"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [],
    "lastVerified": "2026-03-22",
    "tags": [
      "css-modules",
      "css",
      "styling",
      "scoped",
      "components"
    ]
  },
  {
    "id": "daisyui",
    "name": "DaisyUI",
    "category": "styling",
    "description": "Tailwind CSS component library with semantic class names and themes",
    "website": "https://daisyui.com",
    "versions": [
      {
        "version": "4.12"
      },
      {
        "version": "4.11"
      }
    ],
    "defaultVersion": "4.12",
    "requires": [
      "nodejs",
      "tailwindcss"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "react",
      "vue"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "tailwind.config.js",
      "tailwind.config.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "daisyui",
      "tailwindcss",
      "components",
      "themes",
      "styling",
      "ui"
    ]
  },
  {
    "id": "material-ui",
    "name": "Material UI (MUI)",
    "category": "styling",
    "description": "React component library implementing Google's Material Design",
    "website": "https://mui.com",
    "versions": [
      {
        "version": "6.4"
      },
      {
        "version": "6.3"
      },
      {
        "version": "6.2"
      },
      {
        "version": "6.1"
      },
      {
        "version": "6.0"
      },
      {
        "version": "5.16"
      }
    ],
    "defaultVersion": "6.4",
    "requires": [
      "nodejs",
      "react"
    ],
    "incompatibleWith": [
      "shadcn-ui",
      "chakra-ui"
    ],
    "suggestedWith": [
      "nextjs",
      "typescript"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "theme.ts"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "material",
      "mui",
      "ui",
      "components",
      "google",
      "styling"
    ]
  },
  {
    "id": "shadcn-ui",
    "name": "shadcn/ui",
    "category": "styling",
    "description": "Beautifully designed components built with Radix UI and Tailwind CSS",
    "website": "https://ui.shadcn.com",
    "versions": [
      {
        "version": "2.2"
      },
      {
        "version": "2.1"
      },
      {
        "version": "2.0"
      },
      {
        "version": "1.0"
      }
    ],
    "defaultVersion": "2.2",
    "requires": [
      "nodejs",
      "react",
      "tailwindcss"
    ],
    "incompatibleWith": [
      "chakra-ui",
      "material-ui"
    ],
    "suggestedWith": [
      "nextjs",
      "typescript"
    ],
    "officialScaffold": "npx shadcn@latest init",
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "components.json"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "shadcn",
      "ui",
      "components",
      "radix",
      "tailwind",
      "styling"
    ]
  },
  {
    "id": "tailwindcss",
    "name": "Tailwind CSS",
    "category": "styling",
    "description": "Utility-first CSS framework for rapid UI development",
    "website": "https://tailwindcss.com",
    "versions": [
      {
        "version": "4.1"
      },
      {
        "version": "4.0"
      },
      {
        "version": "3.4"
      },
      {
        "version": "3.3"
      }
    ],
    "defaultVersion": "4.1",
    "requires": [
      "nodejs"
    ],
    "incompatibleWith": [],
    "suggestedWith": [
      "react",
      "nextjs",
      "vue"
    ],
    "officialScaffold": null,
    "dockerImage": null,
    "envVars": {},
    "configFiles": [
      "tailwind.config.js",
      "tailwind.config.ts",
      "postcss.config.js"
    ],
    "lastVerified": "2026-03-22",
    "tags": [
      "tailwind",
      "css",
      "utility-first",
      "styling",
      "responsive"
    ]
  }
] as const;

export const templates = [
  {
    "id": "t3-stack",
    "name": "T3 Stack",
    "description": "Full-stack TypeScript app with Next.js, tRPC, Prisma, Tailwind CSS, and NextAuth",
    "technologyIds": [
      "nextjs",
      "react",
      "nodejs",
      "typescript",
      "tailwindcss",
      "prisma",
      "postgresql",
      "nextauth"
    ],
    "profile": "standard",
    "scaffoldSteps": 4,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "django-rest-api",
    "name": "Django REST API",
    "description": "Production-ready REST API with Django, Django REST Framework, PostgreSQL, and Redis",
    "technologyIds": [
      "django",
      "python",
      "postgresql",
      "redis"
    ],
    "profile": "standard",
    "scaffoldSteps": 3,
    "hooks": 1,
    "overrides": 3
  },
  {
    "id": "fastapi-react",
    "name": "FastAPI + React",
    "description": "Full-stack app with FastAPI backend, React frontend, PostgreSQL, and Docker",
    "technologyIds": [
      "fastapi",
      "python",
      "react",
      "nodejs",
      "typescript",
      "postgresql",
      "tailwindcss"
    ],
    "profile": "standard",
    "scaffoldSteps": 4,
    "hooks": 1,
    "overrides": 4
  },
  {
    "id": "go-microservice",
    "name": "Go Microservice",
    "description": "Lightweight Go microservice with Gin, PostgreSQL, Docker, and health checks",
    "technologyIds": [
      "go",
      "gin",
      "postgresql",
      "redis",
      "docker"
    ],
    "profile": "production",
    "scaffoldSteps": 3,
    "hooks": 1,
    "overrides": 4
  },
  {
    "id": "astro-landing",
    "name": "Astro Landing Page",
    "description": "Fast static landing page with Astro, Tailwind CSS, and TypeScript",
    "technologyIds": [
      "astro",
      "nodejs",
      "typescript",
      "tailwindcss"
    ],
    "profile": "lightweight",
    "scaffoldSteps": 2,
    "hooks": 1,
    "overrides": 1
  },
  {
    "id": "sveltekit-fullstack",
    "name": "SvelteKit Full-Stack",
    "description": "Full-stack SvelteKit app with Prisma ORM, PostgreSQL, and Tailwind CSS",
    "technologyIds": [
      "sveltekit",
      "svelte",
      "nodejs",
      "typescript",
      "tailwindcss",
      "prisma",
      "postgresql"
    ],
    "profile": "standard",
    "scaffoldSteps": 4,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "nuxt3-app",
    "name": "Nuxt 3 App",
    "description": "Full-stack Nuxt 3 application with Vue, Tailwind CSS, and PostgreSQL",
    "technologyIds": [
      "nuxt",
      "vue",
      "nodejs",
      "typescript",
      "tailwindcss",
      "postgresql"
    ],
    "profile": "standard",
    "scaffoldSteps": 3,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "express-api",
    "name": "Express API",
    "description": "Production-ready Express.js REST API with TypeScript, Prisma, PostgreSQL, Redis, and Docker",
    "technologyIds": [
      "express",
      "nodejs",
      "typescript",
      "prisma",
      "postgresql",
      "redis",
      "docker"
    ],
    "profile": "production",
    "scaffoldSteps": 6,
    "hooks": 1,
    "overrides": 4
  },
  {
    "id": "hono-microservice",
    "name": "Hono Microservice",
    "description": "Lightweight Hono microservice with Bun runtime, PostgreSQL, and Docker",
    "technologyIds": [
      "hono",
      "nodejs",
      "typescript",
      "postgresql",
      "docker"
    ],
    "profile": "lightweight",
    "scaffoldSteps": 2,
    "hooks": 1,
    "overrides": 3
  },
  {
    "id": "django-react",
    "name": "Django + React",
    "description": "Full-stack app with Django backend, React frontend, PostgreSQL, Redis, Tailwind CSS, and Docker",
    "technologyIds": [
      "django",
      "python",
      "react",
      "nodejs",
      "typescript",
      "postgresql",
      "redis",
      "tailwindcss"
    ],
    "profile": "production",
    "scaffoldSteps": 5,
    "hooks": 2,
    "overrides": 3
  },
  {
    "id": "mern-stack",
    "name": "MERN Stack",
    "description": "Full-stack MERN app with React, Express, MongoDB, Node.js, TypeScript, and Tailwind CSS",
    "technologyIds": [
      "react",
      "nodejs",
      "express",
      "mongodb",
      "typescript",
      "tailwindcss"
    ],
    "profile": "standard",
    "scaffoldSteps": 7,
    "hooks": 1,
    "overrides": 3
  },
  {
    "id": "saas-starter",
    "name": "SaaS Starter",
    "description": "Production-ready SaaS boilerplate with Next.js, Prisma, PostgreSQL, Redis, NextAuth, shadcn/ui, and Stripe-ready architecture",
    "technologyIds": [
      "nextjs",
      "react",
      "nodejs",
      "typescript",
      "tailwindcss",
      "shadcn-ui",
      "prisma",
      "postgresql",
      "redis",
      "nextauth"
    ],
    "profile": "production",
    "scaffoldSteps": 7,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "nestjs-api",
    "name": "NestJS API",
    "description": "Production-ready NestJS REST API with Prisma, PostgreSQL, Redis, and Docker",
    "technologyIds": [
      "nestjs",
      "nodejs",
      "typescript",
      "prisma",
      "postgresql",
      "redis",
      "docker"
    ],
    "profile": "production",
    "scaffoldSteps": 5,
    "hooks": 1,
    "overrides": 3
  },
  {
    "id": "remix-fullstack",
    "name": "Remix Fullstack",
    "description": "Full-stack Remix app with Prisma, PostgreSQL, Tailwind CSS, and TypeScript",
    "technologyIds": [
      "remix",
      "react",
      "nodejs",
      "typescript",
      "tailwindcss",
      "prisma",
      "postgresql"
    ],
    "profile": "standard",
    "scaffoldSteps": 4,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "solidstart-app",
    "name": "SolidStart App",
    "description": "Full-stack SolidStart application with TypeScript, Tailwind CSS, and PostgreSQL",
    "technologyIds": [
      "solidjs",
      "nodejs",
      "typescript",
      "tailwindcss",
      "postgresql"
    ],
    "profile": "standard",
    "scaffoldSteps": 4,
    "hooks": 1,
    "overrides": 2
  },
  {
    "id": "laravel-app",
    "name": "Laravel App",
    "description": "Full-stack Laravel application with MySQL, Redis, and Docker",
    "technologyIds": [
      "laravel",
      "php",
      "mysql",
      "redis",
      "docker"
    ],
    "profile": "standard",
    "scaffoldSteps": 1,
    "hooks": 2,
    "overrides": 2
  },
  {
    "id": "python-ai-lab",
    "name": "Python AI Lab",
    "description": "Python ML/AI development environment with FastAPI, PostgreSQL, Redis, and Docker",
    "technologyIds": [
      "python",
      "fastapi",
      "postgresql",
      "redis",
      "docker"
    ],
    "profile": "production",
    "scaffoldSteps": 4,
    "hooks": 2,
    "overrides": 6
  },
  {
    "id": "tauri-desktop",
    "name": "Tauri Desktop",
    "description": "Cross-platform desktop app with Tauri, React, TypeScript, Tailwind CSS, and SQLite",
    "technologyIds": [
      "react",
      "nodejs",
      "typescript",
      "tailwindcss",
      "sqlite"
    ],
    "profile": "standard",
    "scaffoldSteps": 5,
    "hooks": 2,
    "overrides": 1
  },
  {
    "id": "monorepo-starter",
    "name": "Monorepo Starter",
    "description": "Turborepo monorepo with Next.js frontend, Express API, shared packages, Prisma, PostgreSQL, Biome, and Vitest",
    "technologyIds": [
      "nextjs",
      "react",
      "express",
      "nodejs",
      "typescript",
      "tailwindcss",
      "prisma",
      "postgresql",
      "turborepo",
      "pnpm",
      "biome",
      "vitest"
    ],
    "profile": "enterprise",
    "scaffoldSteps": 7,
    "hooks": 3,
    "overrides": 3
  },
  {
    "id": "htmx-django",
    "name": "HTMX + Django",
    "description": "Server-rendered Django app with HTMX for interactivity, Tailwind CSS, and PostgreSQL — minimal JavaScript",
    "technologyIds": [
      "htmx",
      "django",
      "python",
      "postgresql",
      "tailwindcss"
    ],
    "profile": "lightweight",
    "scaffoldSteps": 5,
    "hooks": 2,
    "overrides": 3
  }
] as const;

export const stats = {
  totalTechnologies: 83,
  totalTemplates: 20,
  categories: ["auth","backend","database","devops","frontend","orm","runtime","service","styling"],
  categoryCounts: {"auth":4,"backend":12,"database":11,"devops":15,"frontend":12,"orm":6,"runtime":7,"service":10,"styling":6},
};
