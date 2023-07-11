import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "../auth/auth.module";
import { RolesModule } from "../roles/roles.module";
import { UsersProfile } from "./users.profile";
import { User } from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]),
    RolesModule,
    forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersProfile],
  exports: [UsersService, UsersProfile]
})
export class UsersModule {
}
