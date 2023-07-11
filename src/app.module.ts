import { Module } from "@nestjs/common";
import { AutomapperModule } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { LoggingModule } from "./logging/logging.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { RolesModule } from "./roles/roles.module";
import { PostsModule } from "./posts/posts.module";
import { LikesModule } from "./likes/likes.module";
import { CommentsModule } from "./comments/comments.module";
import { MessagesModule } from "./messages/messages.module";

@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: configService => ([{
        rootPath: join(__dirname, "..", configService.get("PUBLIC_DIRECTORY"))
      }])
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: configService => ({
        type: configService.get("DB_TYPE"),
        host: configService.get("DB_HOST"),
        port: Number(configService.get("DB_PORT")),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        autoLoadEntities: true,
        extra: { trustServerCertificate: true }
      })
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes()
    }),
    LoggingModule,
    AuthModule,
    RolesModule,
    UsersModule,
    PostsModule,
    LikesModule,
    CommentsModule,
    MessagesModule
  ]
})
export class AppModule {
}