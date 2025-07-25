# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run start:dev
```

**Build for production:**
```bash
npm run build
npm run start:prod
```

**Testing:**
```bash
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Run tests with coverage
```

**Code quality:**
```bash
npm run lint          # Run ESLint with auto-fix
npm run format        # Format code with Prettier
```

## Project Architecture

This is a modern NestJS application with PostgreSQL database integration:

**Core Structure:**
- **src/main.ts** - Application entry point with bootstrap function
- **src/app.module.ts** - Root module with database and config setup
- **src/app.controller.ts** - Main controller with routes:
  - `GET /` - Hello world message
  - `GET /health` - Health check endpoint with uptime
  - `GET /api/hello` - JSON API response

**Database Layer:**
- **src/infrastructure/persistence/drizzle/** - Modern Drizzle ORM setup
  - **schema/** - Database schema definitions with Zod validation
  - **database.factory.ts** - Multi-database support (SQLite/PostgreSQL)
  - **database.module.ts** - Database connection module
- **src/infrastructure/repositories/** - Repository implementations
- **src/domain/** - DDD domain layer with aggregates and value objects
- **src/users/** - Complete User CRUD module:
  - **users.controller.ts** - REST API endpoints (GET, POST, PATCH, DELETE /users)  
  - **users.service.ts** - Business logic with repository pattern
  - **users.module.ts** - Feature module configuration
  - **dto/** - Data transfer objects for validation

## Database Setup

**SQLite (Default):**
- No setup required, database file is created automatically
- Database file: `./data/database.sqlite`

**PostgreSQL (Optional):**
- Set `DATABASE_TYPE=postgresql` in `.env`
- Set `DATABASE_URL=postgresql://username:password@localhost:5432/database_name`

**Environment Configuration:**
Copy `.env.example` to `.env` and configure:
```bash
DATABASE_URL=./data/database.sqlite
DATABASE_TYPE=sqlite
```

**Database Commands:**
```bash
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (GUI)
```

**API Endpoints:**
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Key Features

- TypeScript with modern ES2021 target
- **Drizzle ORM** - Modern, type-safe SQL toolkit
- **Multi-database support** - SQLite (default) + PostgreSQL
- **DDD Architecture** - Domain-driven design with aggregates
- Environment-based configuration
- CORS enabled for web development
- Comprehensive test coverage (unit + e2e)
- ESLint + Prettier for code quality
- Modern NestJS v10 with decorators and dependency injection

## Development Notes

- SQLite for development, easy PostgreSQL migration
- Schema-first approach with Zod validation
- Repository pattern with domain aggregates
- Proper error handling with HTTP exceptions
- Database migrations via Drizzle Kit
- Visual database management with Drizzle Studio