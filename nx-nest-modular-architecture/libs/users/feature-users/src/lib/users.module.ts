import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { ProfilesController } from "./profiles.controller";
import { UsersDataAccessModule } from "./users-data-access.module";

@Module({
  imports: [UsersDataAccessModule],
  controllers: [UsersController, ProfilesController],
})
export class UsersModule {}
