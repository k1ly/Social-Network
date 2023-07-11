import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { Message } from "./entities/message.entity";
import { MessagesProfile } from "./messages.profile";

@Module({
  imports: [TypeOrmModule.forFeature([Message]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule)],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesProfile],
  exports: [MessagesProfile]
})
export class MessagesModule {
}
