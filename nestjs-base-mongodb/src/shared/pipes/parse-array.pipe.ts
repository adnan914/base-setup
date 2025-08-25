import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseArrayPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string[] {
    if (!value) {
      return [];
    }
    
    try {
      // Handle comma-separated values
      if (value.includes(',')) {
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      
      // Handle single value
      return [value.trim()];
    } catch (error) {
      throw new BadRequestException('Validation failed (array string is expected)');
    }
  }
}
