import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException('Date value is required');
    }
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Validation failed (valid date string is expected)');
    }
    
    return date;
  }
}
