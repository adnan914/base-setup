import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === 'true' || value === '1') {
      return true;
    }
    
    if (value === 'false' || value === '0') {
      return false;
    }
    
    throw new BadRequestException('Validation failed (boolean string is expected)');
  }
}
