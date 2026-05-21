import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { SupabaseService } from './supabase.service';
import { DatabaseThrottlerStorage } from './database-throttler.storage';

@Global()
@Module({
  providers: [DatabaseService, SupabaseService, DatabaseThrottlerStorage],
  exports: [DatabaseService, SupabaseService, DatabaseThrottlerStorage],
})
export class DatabaseModule {}
