import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PostsModule } from "../posts/posts.module";
import { AuthModule } from "../auth/auth.module";
import { Comment } from "./entities/comment.entity";
import { CommentsProfile } from "./comments.profile";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]),
    PostsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule)],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsProfile],
  exports: [CommentsProfile]
})
export class CommentsModule {
}
