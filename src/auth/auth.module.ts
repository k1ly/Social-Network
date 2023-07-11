import { forwardRef, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AbilityService } from "./ability/ability.service";
import { TokenService } from "./token/token.service";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          config: {
            url: configService.get("REDIS_URL")
          }
        };
      }
    }),
    JwtModule,
    RolesModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    AuthService,
    AbilityService,
    TokenService, {
      provide: APP_GUARD,
      useClass: AuthGuard
    }],
  exports: [AbilityService]
})
export class AuthModule {
}
