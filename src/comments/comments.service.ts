import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsService } from "../posts/posts.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { Comment } from "./entities/comment.entity";
import { Pageable } from "../util/pagination/pagination.pageable";
import { UsersService } from "../users/users.service";

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService,
              private readonly postsService: PostsService) {
  }

  async findAll(pageable: Pageable<Comment>) {
    try {
      return await this.commentRepository.findAndCount({
          relations: { author: true, post: true },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByPost(postId: number, pageable: Pageable<Comment>) {
    let post = await this.postsService.findById(postId);
    if (!post)
      throw new BadRequestException(`Post with id "${postId}" doesn't exist!`);
    try {
      return await this.commentRepository.findAndCount({
          relations: { author: true, post: true },
          where: { post },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: number) {
    try {
      return await this.commentRepository.findOne({
        relations: { author: true, post: true },
        where: { id }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createCommentDto: CreateCommentDto) {
    let comment = this.mapper.map(createCommentDto, CreateCommentDto, Comment);
    comment.author = await this.usersService.findById(createCommentDto.author);
    if (!comment.author)
      throw new BadRequestException(`User with id "${createCommentDto.author}" doesn't exist!`);
    comment.post = await this.postsService.findById(createCommentDto.post);
    if (!comment.post)
      throw new BadRequestException(`Post with id "${createCommentDto.post}" doesn't exist!`);
    try {
      return await this.commentRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    let comment = this.mapper.map(updateCommentDto, UpdateCommentDto, Comment);
    try {
      return await this.commentRepository.update(id, comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.commentRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
