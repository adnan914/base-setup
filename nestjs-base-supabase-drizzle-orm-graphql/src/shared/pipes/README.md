# Custom Pipes Documentation

## 📋 Overview

This directory contains custom pipes for data transformation and validation in the NestJS application.

## 🚀 Available Pipes

### 1. CustomValidationPipe
Enhanced validation pipe with better error handling and transformation.

**Usage:**
```typescript
// Global usage (in main.ts)
app.useGlobalPipes(new CustomValidationPipe());

// Controller level
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // Validation automatically applied
}
```

### 2. ParseIntPipe
Converts string parameters to integers.

**Usage:**
```typescript
@Get()
findAll(@Query('page', ParseIntPipe) page: number) {
  // page is now a number
  return this.service.findAll(page);
}
```

**Example Request:**
```
GET /users?page=1&limit=10
```

### 3. ParseBooleanPipe
Converts string parameters to boolean values.

**Usage:**
```typescript
@Get()
findAll(@Query('active', ParseBooleanPipe) active: boolean) {
  // active is now a boolean
  return this.service.findActive(active);
}
```

**Example Request:**
```
GET /users?active=true
GET /users?active=1
GET /users?active=false
GET /users?active=0
```

### 4. ParseArrayPipe
Converts string parameters to arrays.

**Usage:**
```typescript
@Get()
findAll(@Query('roles', ParseArrayPipe) roles: string[]) {
  // roles is now an array
  return this.service.findByRoles(roles);
}
```

**Example Request:**
```
GET /users?roles=admin,user,moderator
GET /users?roles=admin
```

### 5. ParseDatePipe
Converts string parameters to Date objects.

**Usage:**
```typescript
@Get()
findAll(@Query('createdAfter', ParseDatePipe) createdAfter: Date) {
  // createdAfter is now a Date object
  return this.service.findAfterDate(createdAfter);
}
```

**Example Request:**
```
GET /users?createdAfter=2023-01-01
GET /users?createdAfter=2023-01-01T10:30:00Z
```

## 🔧 Combined Usage Example

```typescript
@Controller('users')
export class UsersController {
  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('active', ParseBooleanPipe) active?: boolean,
    @Query('roles', ParseArrayPipe) roles?: string[],
    @Query('createdAfter', ParseDatePipe) createdAfter?: Date,
  ) {
    return this.usersService.findAll({
      page,
      limit,
      active,
      roles,
      createdAfter,
    });
  }
}
```

## 📝 Error Handling

All pipes throw `BadRequestException` with descriptive error messages:

```typescript
// ParseIntPipe error
{
  "message": "Validation failed (numeric string is expected)",
  "statusCode": 400
}

// ParseBooleanPipe error
{
  "message": "Validation failed (boolean string is expected)",
  "statusCode": 400
}

// ParseDatePipe error
{
  "message": "Validation failed (valid date string is expected)",
  "statusCode": 400
}
```

## 🎯 Best Practices

1. **Use Default Values**: Always provide default values for optional parameters
2. **Error Handling**: Handle pipe errors gracefully in your controllers
3. **Documentation**: Document expected parameter formats in your API docs
4. **Validation**: Combine pipes with DTO validation for comprehensive data validation
5. **Performance**: Pipes are executed in order, so place most restrictive pipes first

## 🔄 Custom Pipe Creation

To create a new custom pipe:

```typescript
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): any {
    // Your transformation logic here
    if (!this.isValid(value)) {
      throw new BadRequestException('Custom validation error message');
    }
    
    return this.transformValue(value);
  }
  
  private isValid(value: string): boolean {
    // Validation logic
    return true;
  }
  
  private transformValue(value: string): any {
    // Transformation logic
    return value;
  }
}
```

## 📚 Related Documentation

- [NestJS Pipes Documentation](https://docs.nestjs.com/pipes)
- [Class Validator](https://github.com/typestack/class-validator)
- [Class Transformer](https://github.com/typestack/class-transformer)
