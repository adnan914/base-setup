# NestJS Project Structure

## 📁 Complete Project Structure

```
src/
├── features/                    # 🚀 Feature Modules (Business Logic)
│   ├── auth/                   # Authentication Feature
│   │   ├── dto/               # Auth DTOs
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── strategies/        # Passport Strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                  # Users Feature
│   │   ├── dto/               # User DTOs
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── schemas/           # Mongoose Schemas
│   │   │   └── user.schema.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts
│   │   └── users.module.ts
│   └── index.ts               # Feature Modules Export
│
├── shared/                     # 🌐 Shared Module (Global)
│   ├── decorators/            # Original Decorators
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/                # Original Guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/          # Original Interceptors
│   │   ├── response.interceptor.ts
│   │   └── timeout.interceptor.ts
│   ├── filters/               # Original Filters
│   │   └── global-exception.filter.ts
│   ├── logger/                # Original Logger
│   │   └── winston.logger.ts
│   ├── constants/             # Original Constants
│   │   └── index.ts
│   ├── enums/                 # Original Enums
│   │   └── index.ts
│   └── shared.module.ts       # Global Shared Module
│
├── config/                     # ⚙️ Configuration Files
│   ├── app.config.ts          # App Configuration
│   ├── auth.config.ts         # Auth Configuration
│   └── database.config.ts     # Database Configuration
│
├── database/                   # 🗄️ Database Module
│   └── database.module.ts     # MongoDB Connection
│
├── modules/                    # 📦 Module Exports
│   └── index.ts               # All Modules Export
│
├── app.module.ts              # 🏠 Root Application Module
├── app.controller.ts          # Main App Controller
└── main.ts                    # 🚀 Application Entry Point
```

## 🎯 Structure Benefits

### 📁 Features Module
- **Business Logic**: Each feature has its own module
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Testing**: Isolated feature testing

### 🔧 Common Module
- **Reusability**: Shared utilities across features
- **Consistency**: Standardized patterns
- **DRY Principle**: Don't repeat yourself
- **Centralized**: Single source of truth

### 🌐 Shared Module
- **Global Access**: Available throughout the app
- **Providers**: Global services and utilities
- **Configuration**: App-wide settings
- **Interceptors**: Global request/response handling

### ⚙️ Config Module
- **Environment**: Environment-based configuration
- **Security**: Sensitive data management
- **Flexibility**: Easy configuration changes
- **Validation**: Configuration validation

## 🚀 Usage Examples

### Importing from Features
```typescript
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
```

### Importing from Common
```typescript
import { Public } from './common/decorators';
import { JwtAuthGuard } from './common/guards';
import { ResponseInterceptor } from './common/interceptors';
import { ParseIntPipe, ParseBooleanPipe } from './common/pipes';
```

### Importing from Shared
```typescript
import { SharedModule } from './shared/shared.module';
import { ERROR_MESSAGES } from './shared/constants';
import { UserRole } from './shared/enums';
```

## 📋 Best Practices

1. **Feature Isolation**: Each feature is self-contained
2. **Common Utilities**: Shared code in common module
3. **Global Services**: App-wide services in shared module
4. **Configuration**: Environment-based config management
5. **Testing**: Each module can be tested independently
6. **Documentation**: Clear structure documentation
7. **Scalability**: Easy to add new features
8. **Maintainability**: Clear separation of concerns

## 🔄 Migration Guide

When adding new features:
1. Create feature directory in `src/features/`
2. Add feature module to `src/features/index.ts`
3. Import in `src/app.module.ts`
4. Add common utilities to `src/common/` if needed
5. Update documentation

This structure ensures a clean, scalable, and maintainable NestJS application!
