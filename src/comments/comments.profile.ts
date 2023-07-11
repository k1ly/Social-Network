import { Injectable } from "@nestjs/common";
import { MappingProfile, Mapper, createMap, forMember, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentDto } from "./dto/comment.dto";
import { Comment } from "./entities/comment.entity";

@Injectable()
export class CommentsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, Comment, CommentDto,
        forMember(commentDto => commentDto.author, mapFrom(comment => comment.author?.id)),
        forMember(commentDto => commentDto.post, mapFrom(comment => comment.post?.id)));
      createMap(mapper, CreateCommentDto, Comment);
      createMap(mapper, UpdateCommentDto, Comment);
    };
  }
}