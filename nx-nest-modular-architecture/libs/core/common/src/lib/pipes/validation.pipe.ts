import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { RES_MESSAGES } from "../messages";

@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type === "body" && (value === null || value === undefined)) {
      throw new BadRequestException({
        message: RES_MESSAGES.INVALID_REQUEST,
        errors: { body: ["Request body cannot be empty"] },
      });
    }

    if (type !== "body") {
      return value;
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value || {}, {
      enableImplicitConversion: true,
    });

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      const formatted = this.formatErrors(errors);
      const hasNonWhitelisted = Object.values(formatted).some((messages) =>
        (messages as unknown[]).some((m) => String(m).toLowerCase().includes("should not exist")),
      );
      throw new BadRequestException({
        message: hasNonWhitelisted ? RES_MESSAGES.INVALID_REQUEST : RES_MESSAGES.VALIDATION_ERROR,
        errors: formatted,
      });
    }

    return object;
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    const walk = (error: ValidationError, parent?: string) => {
      const path = parent ? `${parent}.${error.property}` : error.property;

      if (error.constraints) {
        result[path] = Object.values(error.constraints);
      }

      if (error.children?.length) {
        error.children.forEach((child) => walk(child, path));
      }
    };

    errors.forEach((e) => walk(e));
    return result;
  }

  private toValidate(metatype: { name?: string } | undefined): boolean {
    const primitives = ["String", "Boolean", "Number", "Array", "Object"];
    return !primitives.includes(metatype?.name);
  }
}
