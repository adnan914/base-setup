# Path Aliases Documentation

## 📋 Overview

This project uses TypeScript path aliases to make imports cleaner and more maintainable. Instead of using relative paths like `../../../../`, we use semantic aliases.

## 🚀 Available Aliases

### Base Aliases
```typescript
"@/*": ["src/*"]                    // Root source directory
"@/common/*": ["src/common/*"]      // Common utilities
"@/shared/*": ["src/shared/*"]      // Shared services
"@/config/*": ["src/config/*"]      // Configuration files
```

## 📝 Usage Examples

### Before (Relative Paths)
```typescript
// ❌ Confusing and hard to maintain
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../../shared/enums';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
```

### After (Path Aliases)
```typescript
// ✅ Clean and semantic
import { UsersService } from '@/features/users/users.service';
import { UserRole } from '@/shared/enums';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CreateUserDto } from '@/features/users/dto/create-user.dto';
```

## 🎯 Common Import Patterns

### Feature Modules
```typescript
// Auth Module
import { AuthService } from '@/features/auth/auth.service';
import { LoginDto } from '@/features/auth/dto/login.dto';
import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy';

// Users Module
import { UsersService } from '@/features/users/users.service';
import { User } from '@/features/users/schemas/user.schema';
import { CreateUserDto } from '@/features/users/dto/create-user.dto';
```

### Shared Utilities
```typescript
// Guards
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';

// Decorators
import { Public } from '@/shared/decorators/public.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';

// Interceptors
import { ResponseInterceptor } from '@/shared/interceptors/response.interceptor';
import { TimeoutInterceptor } from '@/shared/interceptors/timeout.interceptor';

// Filters
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

// Enums & Constants
import { UserRole, UserStatus } from '@/shared/enums';
import { ERROR_MESSAGES } from '@/shared/constants';
```

### Common Utilities
```typescript
// Pipes
import { ParseIntPipe, ParseBooleanPipe } from '@/common/pipes';
import { CustomValidationPipe } from '@/common/pipes/validation.pipe';

// All common utilities
import { Public, JwtAuthGuard, ResponseInterceptor } from '@/common';
```

### Configuration
```typescript
// Config files
import { DatabaseModule } from '@/database/database.module';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
```

## 🔧 Configuration

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/shared/*": ["src/shared/*"],
      "@/config/*": ["src/config/*"]
    }
  }
}
```

### NestJS CLI Configuration (nest-cli.json)
```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]
  }
}
```

## 🎯 Benefits

### 1. **Cleaner Imports**
```typescript
// Before
import { Something } from '../../../../../../shared/something';

// After
import { Something } from '@/shared/something';
```

### 2. **Easier Refactoring**
- Move files without breaking imports
- IDE auto-completion works better
- No need to count `../` levels

### 3. **Better Readability**
```typescript
// Clear intent
import { AuthService } from '@/features/auth/auth.service';
import { UserRole } from '@/shared/enums';
```

### 4. **Consistent Structure**
- All imports follow the same pattern
- Easy to understand project structure
- Better team collaboration

## 📁 File Structure with Aliases

```
src/
├── features/                    # 🚀 Business Logic
│   ├── auth/                   # @/features/auth/*
│   │   ├── dto/               # @/features/auth/dto/*
│   │   ├── strategies/        # @/features/auth/strategies/*
│   │   └── auth.service.ts    # @/features/auth/auth.service
│   └── users/                  # @/features/users/*
│       ├── dto/               # @/features/users/dto/*
│       ├── schemas/           # @/features/users/schemas/*
│       └── users.service.ts   # @/features/users/users.service
├── common/                     # 🔧 Shared Utilities
│   ├── pipes/                 # @/common/pipes/*
│   ├── guards/                # @/common/guards/*
│   └── decorators/            # @/common/decorators/*
├── shared/                     # 🌐 Global Services
│   ├── guards/                # @/shared/guards/*
│   ├── interceptors/          # @/shared/interceptors/*
│   ├── filters/               # @/shared/filters/*
│   └── enums/                 # @/shared/enums/*
├── config/                     # ⚙️ Configuration
│   ├── app.config.ts          # @/config/app.config
│   └── database.config.ts     # @/config/database.config
└── database/                   # 🗄️ Database
    └── database.module.ts     # @/database/database.module
```

## 🚀 Migration Guide

### Step 1: Update tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/shared/*": ["src/shared/*"],
      "@/config/*": ["src/config/*"]
    }
  }
}
```

### Step 2: Replace Relative Imports
```bash
# Find all relative imports
find src -name "*.ts" -exec grep -l "\.\./" {} \;

# Replace with aliases
# ../../shared/ -> @/shared/
# ../users/ -> @/features/users/
# ./common/ -> @/common/
```

### Step 3: Test Build
```bash
npm run build
```

## 🎯 Best Practices

1. **Use Semantic Names**: Choose aliases that describe the purpose
2. **Be Consistent**: Use the same alias pattern throughout the project
3. **Group Related Files**: Keep related files under the same alias
4. **Document Changes**: Update documentation when adding new aliases
5. **IDE Support**: Ensure your IDE supports path mapping

## 🔍 IDE Configuration

### VS Code
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.paths": true
}
```

### WebStorm
- Enable TypeScript path mapping
- Configure module resolution

## 📚 Related Documentation

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [NestJS Module System](https://docs.nestjs.com/modules)
- [ESLint Import Rules](https://github.com/benmosher/eslint-plugin-import)

---

**Path aliases make your code cleaner, more maintainable, and easier to understand! 🎯**
