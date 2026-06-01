# Simple Folder Structure

## 📂 Quick Visual Reference

```
poc/
│
├── 📱 apps/                          # Applications (deployable)
│   ├── api-gateway/                 # External entrypoint
│   ├── auth-service/                # Authentication service
│   ├── user-service/                # User/profile service
│   ├── academic-service/            # Academic hierarchy service
│   └── analytics-service/           # Analytics service
│
├── 📚 libs/                          # Reusable libraries
│   │
│   ├── 🔧 core/                      # Infrastructure
│   │   │
│   │   ├── auth/                     # JWT Authentication
│   │   │   └── src/lib/
│   │   │       ├── dto/
│   │   │       │   ├── login.dto.ts
│   │   │       │   └── refresh-token.dto.ts
│   │   │       ├── guards/
│   │   │       │   └── jwt-auth.guard.ts
│   │   │       ├── strategies/
│   │   │       │   └── jwt.strategy.ts
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.service.ts
│   │   │       └── auth.module.ts
│   │   │
│   │   ├── common/                   # Shared utilities
│   │   │   └── src/lib/
│   │   │       ├── decorators/
│   │   │       │   └── roles.decorator.ts
│   │   │       ├── enums/
│   │   │       │   └── user-role.enum.ts
│   │   │       └── guards/
│   │   │           └── roles.guard.ts
│   │   │
│   │   └── database/                 # TypeORM config
│   │       └── src/lib/
│   │           └── database.module.ts
│   │
│   └── 💼 modules/                   # Business logic
│       │
│       ├── users/                    # User domain
│       │   └── src/lib/
│       │       ├── entities/
│       │       │   └── user.entity.ts
│       │       ├── users.service.ts
│       │       └── users.module.ts
│       │
│       └── orders/                   # Order domain
│           └── src/lib/
│               ├── dto/
│               │   └── create-order.dto.ts
│               ├── entities/
│               │   └── order.entity.ts
│               ├── orders.controller.ts
│               ├── orders.service.ts
│               └── orders.module.ts
│
├── 🗄️ migrations/                    # Database migrations
│   └── 1707838559000-InitialSchema.ts
│
├── 🛠️ scripts/                       # Utility scripts
│   └── test-api.js
│
├── ⚙️ Configuration Files
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Env template
│   ├── data-source.ts                # TypeORM CLI config
│   ├── nx.json                       # Nx workspace config
│   ├── package.json                  # Dependencies
│   ├── tsconfig.base.json            # TS path mappings
│   ├── quick-start.sh                # Quick start script
│   └── README.md                     # Documentation
│
└── 📖 Documentation (in .gemini/antigravity/brain/)
    ├── ARCHITECTURE.md               # This file
    ├── DOCUMENTATION.md              # Technical deep dive
    ├── SETUP_AND_COMMANDS.md         # Setup & Nx commands
    ├── TROUBLESHOOTING.md            # Common issues
    ├── walkthrough.md                # Implementation guide
    └── task.md                       # Task checklist
```

---

## 🎯 Key Directories Explained

| Directory              | Purpose                       | Example                     |
| ---------------------- | ----------------------------- | --------------------------- |
| `apps/api-gateway/`    | External entry point          | Routing, gateway health     |
| `libs/core/auth/`      | Authentication infrastructure | JWT, login, logout          |
| `libs/core/common/`    | Shared utilities              | RBAC, decorators, guards    |
| `libs/core/database/`  | Database configuration        | TypeORM, PostgreSQL         |
| `libs/modules/users/`  | User business logic           | User CRUD, password hashing |
| `libs/modules/orders/` | Order business logic          | Order CRUD, user relations  |
| `migrations/`          | Database schema changes       | SQL migrations              |
| `scripts/`             | Utility scripts               | API testing, seeding        |

---

## 📦 Module Import Paths

```typescript
// Clean imports using path mappings from tsconfig.base.json

import { AuthModule } from '@lib/auth/feature-auth';
import { DatabaseModule } from '@lib/core/database';
import { UserRole, Roles, RolesGuard } from '@lib/core/common';
import { UsersModule } from '@lib/users/feature-users';
import { OrdersModule } from '@lib/modules/orders';
```

---

## 🔄 Request Flow

```
HTTP Request
    ↓
apps/api-gateway/main.ts (Global Pipes, Interceptors)
    ↓
apps/api-gateway/app.module.ts (Route to module)
    ↓
libs/core/auth/guards/jwt-auth.guard.ts (Authenticate)
    ↓
libs/core/common/guards/roles.guard.ts (Authorize)
    ↓
libs/modules/orders/orders.controller.ts (Handle request)
    ↓
libs/modules/orders/orders.service.ts (Business logic)
    ↓
libs/modules/orders/entities/order.entity.ts (Database)
    ↓
Response
```

---

## 🚀 Quick Navigation

**Want to understand:**

- **Authentication?** → `libs/core/auth/`
- **Authorization?** → `libs/core/common/guards/roles.guard.ts`
- **User management?** → `libs/modules/users/`
- **Order management?** → `libs/modules/orders/`
- **Database config?** → `libs/core/database/`
- **App bootstrap?** → `apps/api-gateway/src/main.ts`
- **Module wiring?** → `apps/api-gateway/src/app/app.module.ts`

---

## 📊 File Count

```
Total Files: ~60
├── TypeScript files: ~40
├── Configuration files: ~15
├── Documentation files: ~6
└── Scripts: ~2
```

---

## 💡 Design Philosophy

1. **apps/** = Thin orchestration layer (minimal code)
2. **libs/core/** = Infrastructure (reusable across apps)
3. **libs/modules/** = Business logic (domain-driven)
4. **Clean imports** = Using TypeScript path mappings
5. **Enforced boundaries** = Nx dependency rules

This structure supports a **modular monolith with service-style boundaries**. 🎯
