import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikesService } from "./likes.service";
import { LikesController } from "./likes.controller";
import { PostsModule } from "../posts/posts.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { Like } from "./entities/like.entity";
import { LikesProfile } from "./likes.profile";

@Module({
  imports: [TypeOrmModule.forFeature([Like]),
    PostsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule)],
  controllers: [LikesController],
  providers: [LikesService, LikesProfile],
  exports: [LikesProfile]
})
export class LikesModule {
}
