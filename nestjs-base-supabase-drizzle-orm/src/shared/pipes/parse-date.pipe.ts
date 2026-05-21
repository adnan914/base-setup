import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { MESSAGES } from '@/shared/constants';

@Injectable()
export class ParseDatePipe implements PipeTransform<string> {
  transform(value: string, _metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException(MESSAGES.VALIDATION_DATE_REQUIRED);
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(MESSAGES.VALIDATION_DATE_STRING);
    }

    return date;
  }
}
