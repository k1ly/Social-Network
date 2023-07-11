import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "../users/users.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Post } from "./entities/post.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private readonly postRepository: Repository<Post>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService) {
  }

  async findAll(pageable: Pageable<Post>) {
    try {
      return await this.postRepository.findAndCount({
          relations: { author: true },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByAuthor(authorId: number, pageable: Pageable<Post>) {
    let author = await this.usersService.findById(authorId);
    if (!author)
      throw new BadRequestException(`User with id "${authorId}" doesn't exist!`);
    try {
      return await this.postRepository.findAndCount({
          relations: { author: true },
          where: { author },
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
      return await this.postRepository.findOne({
        relations: { author: true },
        where: { id }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createPostDto: CreatePostDto) {
    let post = this.mapper.map(createPostDto, CreatePostDto, Post);
    post.author = await this.usersService.findById(createPostDto.author);
    if (!post.author)
      throw new BadRequestException(`User with id "${createPostDto.author}" doesn't exist!`);
    try {
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    let post = this.mapper.map(updatePostDto, UpdatePostDto, Post);
    try {
      return await this.postRepository.update(id, post);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.postRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
