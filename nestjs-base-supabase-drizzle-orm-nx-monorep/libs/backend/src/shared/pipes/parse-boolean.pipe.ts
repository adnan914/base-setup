import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { MESSAGES } from '@/shared/constants';

@Injectable()
export class ParseBooleanPipe implements PipeTransform<
  string,
  boolean | undefined
> {
  transform(value: string, _metadata: ArgumentMetadata): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (value === 'true' || value === '1') {
      return true;
    }

    if (value === 'false' || value === '0') {
      return false;
    }

    throw new BadRequestException(MESSAGES.VALIDATION_BOOLEAN_STRING);
  }
}
