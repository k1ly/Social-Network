import { Injectable } from "@nestjs/common";
import {
  AbilityBuilder, ExtractSubjectType, InferSubjects,
  MatchConditions, PureAbility, AbilityTuple
} from "@casl/ability";
import { AbilityAction } from "./ability.action";
import { RolesNames } from "../../roles/roles.names";
import { Role } from "../../roles/entities/role.entity";
import { UserDto } from "../../users/dto/user.dto";
import { User } from "../../users/entities/user.entity";
import { Post } from "../../posts/entities/post.entity";
import { Like } from "../../likes/entities/like.entity";
import { Comment } from "../../comments/entities/comment.entity";
import { Message } from "../../messages/entities/message.entity";

type Subject =
  InferSubjects<typeof Role | typeof User | typeof Post | typeof Like | typeof Comment | typeof Message, true>
  | "all";

type AppAbility = PureAbility<AbilityTuple, MatchConditions>;
const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

@Injectable()
export class AbilityService {
  authorize(auth: UserDto, action: AbilityAction, subject: Subject): boolean {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);
    switch (auth.role) {
      case RolesNames.Admin:
        can(AbilityAction.Read, Role);
        can(AbilityAction.Read, User);
        can(AbilityAction.Update, User);
        can(AbilityAction.Create, User, ({ id }) => id === auth.id);
        can(AbilityAction.Manage, Post);
        can(AbilityAction.Read, Like);
        can(AbilityAction.Create, Like);
        can(AbilityAction.Delete, Like, ({ author }) => author.id === auth.id);
        can(AbilityAction.Read, Comment);
        can(AbilityAction.Create, Comment);
        can(AbilityAction.Update, Comment, ({ author }) => author.id === auth.id);
        can(AbilityAction.Delete, Comment, ({ author }) => author.id === auth.id);
        can(AbilityAction.Read, Message);
        can(AbilityAction.Create, Message);
        can(AbilityAction.Update, Message,
          ({ fromUser, toUser }) => fromUser.id === auth.id || toUser.id === auth.id);
        can(AbilityAction.Delete, Message,
          ({ fromUser, toUser }) => fromUser.id === auth.id || toUser.id === auth.id);
        break;
      case RolesNames.Client:
        can(AbilityAction.Read, Role);
        can(AbilityAction.Read, User);
        can(AbilityAction.Create, User, ({ id }) => id === auth.id);
        can(AbilityAction.Read, Post);
        can(AbilityAction.Create, Post);
        can(AbilityAction.Update, Post, ({ author }) => author.id === auth.id);
        can(AbilityAction.Read, Like);
        can(AbilityAction.Create, Like);
        can(AbilityAction.Delete, Like, ({ author }) => author.id === auth.id);
        can(AbilityAction.Read, Comment);
        can(AbilityAction.Create, Comment);
        can(AbilityAction.Update, Comment, ({ author }) => author.id === auth.id);
        can(AbilityAction.Delete, Comment, ({ author }) => author.id === auth.id);
        can(AbilityAction.Read, Message,
          ({ fromUser, toUser }) => fromUser.id === auth.id || toUser.id === auth.id);
        can(AbilityAction.Create, Message);
        can(AbilityAction.Update, Message,
          ({ fromUser, toUser }) => fromUser.id === auth.id || toUser.id === auth.id);
        can(AbilityAction.Delete, Message,
          ({ fromUser, toUser }) => fromUser.id === auth.id || toUser.id === auth.id);
        break;
      case RolesNames.Guest:
        can(AbilityAction.Read, Role);
        can(AbilityAction.Read, Post);
        can(AbilityAction.Read, Like);
        can(AbilityAction.Read, Comment);
        break;
    }
    let ability = build({
      conditionsMatcher: lambdaMatcher,
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subject>
    });
    return ability.can(action, subject);
  }
}