# Modern NestJS Task Management System 🚀

A comprehensive task management system built with modern NestJS, implementing Domain-Driven Design (DDD) patterns and featuring a multi-database architecture with SQLite and PostgreSQL support.

## ✨ Features

- 🏗️ **Domain-Driven Design (DDD)** - Clean architecture with aggregates, value objects, and domain events
- 🗄️ **Multi-Database Support** - SQLite for development, PostgreSQL for production
- 🔄 **Modern ORM** - Drizzle ORM with type-safety and migrations
- 🧪 **Comprehensive Testing** - 81+ tests with unit, integration, and E2E coverage
- 📊 **Real-time APIs** - RESTful endpoints with health monitoring
- 🎯 **Type Safety** - Full TypeScript implementation
- 🔧 **Modern Tooling** - ESLint, Prettier, Jest, and development scripts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite (included) or PostgreSQL (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/terukusu/claude-code-practice.git
cd claude-code-practice

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run start:dev
```

The application will be available at `http://localhost:3000`

## 📖 API Documentation

### Health Check Endpoints

- `GET /` - Hello world message
- `GET /health` - System health check with uptime
- `GET /api/hello` - JSON API status

### User Management

- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example API Usage

```bash
# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe", "bio": "Software Developer"}'

# Get all users
curl http://localhost:3000/users

# Health check
curl http://localhost:3000/health
```

## 🧪 Testing

This project includes comprehensive testing with 81+ test cases covering all layers.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov

# Run specific test files
npm test -- src/domain/value-objects/email.value-object.spec.ts
```

### Test Coverage

- **Domain Layer**: 96%+ coverage
- **Value Objects**: 100% coverage
- **Aggregates**: 96% coverage
- **Controllers**: 100% coverage

### Test Structure

```
src/
├── domain/
│   ├── value-objects/          # Value object unit tests
│   ├── aggregates/             # Domain aggregate tests
│   └── events/                 # Domain event tests
├── infrastructure/
│   └── repositories/           # Repository integration tests
└── app.controller.spec.ts      # Controller tests

test/
└── app.e2e-spec.ts            # End-to-end API tests
```

## 🗄️ Database Configuration

### SQLite (Default - Development)

No additional setup required. Database file is created automatically at `./data/database.sqlite`.

### PostgreSQL (Production)

1. Install PostgreSQL
2. Create database: `createdb hello_nestjs`
3. Update `.env`:

```env
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/hello_nestjs
```

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Apply schema to database
npm run db:push

# Open Drizzle Studio (Database GUI)
npm run db:studio
```

## 🏗️ Project Architecture

### Domain-Driven Design Structure

```
src/
├── domain/                     # Domain Layer (Business Logic)
│   ├── aggregates/            # Domain aggregates (Task, Project)
│   ├── entities/              # Domain entities
│   ├── value-objects/         # Value objects (Email, Priority, etc.)
│   ├── events/                # Domain events
│   └── repositories/          # Repository interfaces
├── application/               # Application Layer
│   ├── commands/              # Command handlers (CQRS)
│   ├── queries/               # Query handlers
│   └── services/              # Application services
├── infrastructure/            # Infrastructure Layer
│   ├── persistence/           # Database configuration
│   └── repositories/          # Repository implementations
└── presentation/              # Presentation Layer
    ├── controllers/           # REST controllers
    └── dto/                   # Data transfer objects
```

### Key Components

- **Value Objects**: Email, TaskStatus, Priority with built-in validation
- **Aggregates**: Task and Project with business rules and domain events
- **Repository Pattern**: Clean data access abstraction
- **CQRS Ready**: Command and query separation
- **Domain Events**: Event-driven architecture support

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev              # Start with hot reload
npm run start:debug            # Start with debugging
npm run start:prod             # Production mode

# Building
npm run build                  # Build for production

# Code Quality
npm run lint                   # Run ESLint with auto-fix
npm run format                 # Format code with Prettier

# Database
npm run db:generate            # Generate migrations
npm run db:push                # Push schema changes
npm run db:studio              # Open database GUI
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
DATABASE_URL=./data/database.sqlite
DATABASE_TYPE=sqlite

# Application
PORT=3000
NODE_ENV=development
```

## 📁 Project Structure

```
hello_nestjs/
├── src/
│   ├── domain/                # Domain logic
│   ├── application/           # Application services
│   ├── infrastructure/        # Data access & external concerns
│   ├── users/                 # User feature module
│   ├── app.controller.ts      # Main application controller
│   ├── app.module.ts          # Root module
│   ├── app.service.ts         # Application service
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
├── drizzle.config.ts          # Database configuration
├── nest-cli.json              # NestJS CLI configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment template
├── CLAUDE.md                  # Development guidance
└── README.md                  # This file
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure PostgreSQL database
3. Set up proper environment variables
4. Configure process manager (PM2, Docker, etc.)

### Docker Support (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📚 Learning Resources

This project demonstrates:

- **Domain-Driven Design** patterns in TypeScript
- **Clean Architecture** principles
- **SOLID** design principles
- **Test-Driven Development** practices
- **Modern NestJS** development patterns
- **Type-safe ORM** usage with Drizzle

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database powered by [Drizzle ORM](https://orm.drizzle.team/)
- Testing with [Jest](https://jestjs.io/)
- Code quality with [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)

---

**🔥 Happy Coding!** Built with ❤️ using modern TypeScript and NestJS patterns.