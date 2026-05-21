import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { MESSAGES } from '@/shared/constants';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number | undefined> {
  transform(value: string, _metadata: ArgumentMetadata): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException(MESSAGES.NUMERIC_STRING_EXPECTED);
    }

    return val;
  }
}
