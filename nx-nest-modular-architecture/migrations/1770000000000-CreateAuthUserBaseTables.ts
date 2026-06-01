import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthUserBaseTables1770000000000 implements MigrationInterface {
  name = "CreateAuthUserBaseTables1770000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BLOCKED')`);
    await queryRunner.query(`CREATE TYPE "public"."tokens_type_enum" AS ENUM('ACCESS', 'REFRESH', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'OTP', 'PASSWORD_SETUP')`);

    await queryRunner.query(`
      CREATE TABLE "modules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_modules_name" UNIQUE ("name"),
        CONSTRAINT "PK_modules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_module_permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "access_allowed" boolean NOT NULL DEFAULT false,
        "role_id" uuid,
        "module_id" uuid,
        CONSTRAINT "UQ_role_module_permissions_role_module" UNIQUE ("role_id", "module_id"),
        CONSTRAINT "PK_role_module_permissions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_role_module_permissions_role_id" ON "role_module_permissions" ("role_id")`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role_id" uuid,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying(15),
        "profile_image_url" text,
        "password" text,
        "email_verified_at" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "uq_users_email_lower" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "expires_at" TIMESTAMP,
        "used" boolean NOT NULL DEFAULT false,
        "type" "public"."tokens_type_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_name" character varying(100) NOT NULL,
        "module" character varying(100) NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" uuid,
        "action" character varying(50) NOT NULL,
        "message" text,
        "performed_by_user_id" uuid,
        "performed_by_email" character varying(150),
        "performed_by_role" character varying(100),
        "target_snapshot_jsonb" jsonb,
        "changes_jsonb" jsonb,
        "meta_jsonb" jsonb,
        "ip_address" character varying(100),
        "user_agent" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_service_name" ON "audit_logs" ("service_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_module" ON "audit_logs" ("module")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_id" ON "audit_logs" ("entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_performed_by_user_id" ON "audit_logs" ("performed_by_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);

    await queryRunner.query(`
      ALTER TABLE "role_module_permissions"
      ADD CONSTRAINT "FK_role_module_permissions_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "role_module_permissions"
      ADD CONSTRAINT "FK_role_module_permissions_module"
      FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_role"`);
    await queryRunner.query(`ALTER TABLE "role_module_permissions" DROP CONSTRAINT "FK_role_module_permissions_module"`);
    await queryRunner.query(`ALTER TABLE "role_module_permissions" DROP CONSTRAINT "FK_role_module_permissions_role"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_performed_by_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_module"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_service_name"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_role_module_permissions_role_id"`);
    await queryRunner.query(`DROP TABLE "role_module_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "modules"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
  }
}
