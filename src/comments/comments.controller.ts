import {
  Controller, Get, Post, Body, Param, Delete, Query,
  ForbiddenException, NotFoundException, Put
} from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { CommentsService } from "./comments.service";
import { AbilityAction } from "../auth/ability/ability.action";
import { AbilityService } from "../auth/ability/ability.service";
import { Auth } from "../auth/auth.decorator";
import { UserDto } from "../users/dto/user.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentDto } from "./dto/comment.dto";
import { Comment } from "./entities/comment.entity";
import { Pagination } from "../util/pagination/pagination.decorator";
import { Pageable } from "../util/pagination/pagination.pageable";

@ApiTags("comments")
@Controller("api/comments")
export class CommentsController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly commentsService: CommentsService,
              private readonly abilityService: AbilityService) {
  }

  @Get()
  async findAll(@Query("post") post: number,
                @Pagination() pageable: Pageable<Comment>,
                @Auth() auth: UserDto) {
    let [comments, total] = post ? await this.commentsService.findByPost(post, pageable) : await this.commentsService.findAll(pageable);
    if (comments.some(comment => !this.abilityService.authorize(auth, AbilityAction.Read, comment)))
      throw new ForbiddenException();
    return {
      content: this.mapper.mapArray(comments, Comment, CommentDto),
      total: Math.ceil(total / pageable.size),
      pageable
    };
  }

  @Get(":id")
  async findById(@Param("id") id: number, @Auth() auth: UserDto) {
    let comment = await this.commentsService.findById(id);
    if (!comment)
      throw new NotFoundException(`Comment with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Read, comment))
      throw new ForbiddenException();
    return this.mapper.map(comment, Comment, CommentDto);
  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Auth() auth: UserDto) {
    if (!this.abilityService.authorize(auth, AbilityAction.Create, Comment) || auth.blocked)
      throw new ForbiddenException();
    createCommentDto.author = auth.id;
    await this.commentsService.create(createCommentDto);
  }

  @Put(":id")
  async update(@Param("id") id: number, @Body() updateCommentDto: UpdateCommentDto, @Auth() auth: UserDto) {
    let comment = await this.commentsService.findById(id);
    if (!comment)
      throw new NotFoundException(`Comment with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Update, comment))
      throw new ForbiddenException();
    await this.commentsService.update(id, updateCommentDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number, @Auth() auth: UserDto) {
    let comment = await this.commentsService.findById(id);
    if (!comment)
      throw new NotFoundException(`Comment with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Delete, comment))
      throw new ForbiddenException();
    await this.commentsService.remove(id);
  }
}
