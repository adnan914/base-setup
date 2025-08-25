# NestJS Production-Ready Application

A production-ready NestJS application with MongoDB, JWT authentication, comprehensive error handling, logging, and testing setup.

## 🚀 Features

- **Modular Architecture**: Feature-based modules with shared utilities
- **MongoDB Integration**: Mongoose with proper schema validation
- **JWT Authentication**: Access and refresh tokens with Passport
- **Role-Based Access Control**: Guards and decorators for authorization
- **Validation**: Class-validator and class-transformer for DTO validation
- **Error Handling**: Global exception filter with standardized responses
- **Logging**: Winston logger with file and console outputs
- **API Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest setup for unit and e2e tests
- **Docker Support**: Multi-stage Dockerfile and docker-compose
- **Security**: Helmet, CORS, and other security middlewares
- **Configuration**: Environment-based configuration management

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- Docker & Docker Compose (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nestjs-production-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   API_PREFIX=api/v1
   MONGODB_URI=mongodb://localhost:27017/nestjs-app
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_ACCESS_TOKEN_EXPIRES_IN=15m
   JWT_REFRESH_TOKEN_EXPIRES_IN=7d
   LOG_LEVEL=info
   CORS_ORIGIN=http://localhost:3000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Using Docker
```bash
# Start all services (app + MongoDB + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/docs
```

## 🔐 Authentication

The application uses JWT authentication with access and refresh tokens.

### Available Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout (requires authentication)

### Protected Routes

Most routes require authentication. Use the `@Public()` decorator to make routes public:

```typescript
@Public()
@Get('public-route')
publicRoute() {
  return 'This route is public';
}
```

### Role-Based Access

Use the `@Roles()` decorator to restrict access by user roles:

```typescript
@Roles(UserRole.ADMIN)
@Get('admin-only')
adminRoute() {
  return 'Admin only content';
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Auth DTOs
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Users module
│   ├── dto/             # User DTOs
│   ├── schemas/         # Mongoose schemas
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── shared/              # Shared utilities
│   ├── constants/       # Application constants
│   ├── decorators/      # Custom decorators
│   ├── enums/          # TypeScript enums
│   ├── filters/        # Exception filters
│   ├── guards/         # Authentication guards
│   ├── interceptors/   # Response interceptors
│   └── logger/         # Winston logger
├── config/             # Configuration files
├── database/           # Database module
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## 🔧 Configuration

The application uses `@nestjs/config` for configuration management. Configuration files are located in `src/config/`:

- `database.config.ts` - MongoDB connection settings
- `auth.config.ts` - JWT and authentication settings
- `app.config.ts` - General application settings

## 📝 Logging

The application uses Winston for logging with the following features:

- Console and file logging
- Different log levels (error, warn, info, debug, verbose)
- Structured logging with timestamps
- Separate error log file

Log files are stored in the `logs/` directory.

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t nestjs-app .
docker run -p 3000:3000 nestjs-app
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Class-validator for request validation
- **SQL Injection Protection**: Mongoose ODM protection

## 📊 Monitoring

The application includes:

- Health check endpoint
- Request logging
- Error tracking
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
