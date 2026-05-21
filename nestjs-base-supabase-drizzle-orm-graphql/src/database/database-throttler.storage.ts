import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { sql } from 'drizzle-orm';
import { DatabaseService } from './database.service';

type RateLimitRecord = {
  isBlocked: boolean;
  timeToBlockExpire: number;
  timeToExpire: number;
  totalHits: number;
};

@Injectable()
export class DatabaseThrottlerStorage implements ThrottlerStorage {
  private lastCleanupAt = 0;

  constructor(private readonly databaseService: DatabaseService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const result = await this.databaseService.db.execute<RateLimitRecord>(sql`
      with next_rate_limit as (
        insert into "rate_limits" (
          "key",
          "throttler_name",
          "total_hits",
          "expires_at",
          "block_expires_at"
        )
        values (
          ${key},
          ${throttlerName},
          1,
          now() + ${ttl} * interval '1 millisecond',
          null
        )
        on conflict ("key", "throttler_name") do update set
          "total_hits" = case
            when "rate_limits"."expires_at" <= now() then 1
            when "rate_limits"."block_expires_at" > now()
              then "rate_limits"."total_hits"
            else "rate_limits"."total_hits" + 1
          end,
          "expires_at" = case
            when "rate_limits"."expires_at" <= now()
              then now() + ${ttl} * interval '1 millisecond'
            else "rate_limits"."expires_at"
          end,
          "block_expires_at" = case
            when "rate_limits"."block_expires_at" > now()
              then "rate_limits"."block_expires_at"
            when (
              case
                when "rate_limits"."expires_at" <= now() then 1
                else "rate_limits"."total_hits" + 1
              end
            ) > ${limit}
              then now() + ${blockDuration} * interval '1 millisecond'
            else null
          end,
          "updated_at" = now()
        returning
          "total_hits" as "totalHits",
          "expires_at" as "expiresAt",
          "block_expires_at" as "blockExpiresAt"
      )
      select
        "totalHits",
        greatest(ceil(extract(epoch from ("expiresAt" - now()))), 0)::int
          as "timeToExpire",
        ("blockExpiresAt" > now()) as "isBlocked",
        greatest(
          ceil(extract(epoch from ("blockExpiresAt" - now()))),
          0
        )::int as "timeToBlockExpire"
      from next_rate_limit
    `);
    const record = result.rows[0];
    await this.cleanupExpiredRecords();

    return {
      totalHits: Number(record.totalHits),
      timeToExpire: Number(record.timeToExpire),
      isBlocked: Boolean(record.isBlocked),
      timeToBlockExpire: Number(record.timeToBlockExpire),
    };
  }

  private async cleanupExpiredRecords() {
    const now = Date.now();

    if (now - this.lastCleanupAt < 300000) {
      return;
    }

    this.lastCleanupAt = now;
    await this.databaseService.db.execute(sql`
      delete from "rate_limits"
      where "expires_at" <= now()
        and (
          "block_expires_at" is null
          or "block_expires_at" <= now()
        )
    `);
  }
}
