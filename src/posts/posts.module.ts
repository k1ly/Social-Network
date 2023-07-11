import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { Post } from "./entities/post.entity";
import { PostsProfile } from "./posts.profile";
import { join } from "path";
import { diskStorage } from "multer";

@Module({
  imports: [TypeOrmModule.forFeature([Post]),
    MulterModule.registerAsync(
      {
        imports: [ConfigModule.forRoot()],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          dest: join(__dirname, configService.get("PUBLIC_DIRECTORY"), "posts"),
          storage: diskStorage({
            destination: join(".", configService.get("PUBLIC_DIRECTORY"), "posts")
          })
        })
      }),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule)],
  controllers: [PostsController],
  providers: [PostsService, PostsProfile],
  exports: [PostsService, PostsProfile]
})
export class PostsModule {
}
