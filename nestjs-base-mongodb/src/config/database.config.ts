import { registerAs } from '@nestjs/config';
export default registerAs('database', () => ({
  uri: process.env.DB_URL || 'mongodb://localhost:27017/nestjs-app',
}));
