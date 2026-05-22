import { SetMetadata } from '@nestjs/common';

export const MESSAGES = 'messages';

export const Messages = (message: string) => SetMetadata(MESSAGES, message);
