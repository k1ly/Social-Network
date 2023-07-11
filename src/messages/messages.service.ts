import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "../users/users.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { Message } from "./entities/message.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>,
              @InjectMapper() private readonly mapper: Mapper,
              private readonly usersService: UsersService) {
  }

  async findAll(pageable: Pageable<Message>) {
    try {
      return await this.messageRepository.findAndCount({
          relations: { fromUser: true, toUser: true },
          skip: pageable.page * pageable.size,
          take: pageable.size,
          order: { [pageable.sort]: pageable.order }
        }
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByUsers(fromUserId: number, toUserId: number, pageable: Pageable<Message>) {
    let fromUser = await this.usersService.findById(fromUserId);
    if (!fromUser)
      throw new BadRequestException(`User with id "${fromUserId}" doesn't exist!`);
    let toUser = await this.usersService.findById(toUserId);
    if (!toUser)
      throw new BadRequestException(`User with id "${toUserId}" doesn't exist!`);
    try {
      return await this.messageRepository.findAndCount({
          relations: { fromUser: true, toUser: true },
          where: { fromUser, toUser },
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
      return await this.messageRepository.findOne({
        relations: { fromUser: true, toUser: true },
        where: { id }
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createMessageDto: CreateMessageDto) {
    let message = this.mapper.map(createMessageDto, CreateMessageDto, Message);
    message.fromUser = await this.usersService.findById(createMessageDto.fromUser);
    if (!message.fromUser)
      throw new BadRequestException(`User with id "${createMessageDto.fromUser}" doesn't exist!`);
    message.toUser = await this.usersService.findById(createMessageDto.toUser);
    if (!message.toUser)
      throw new BadRequestException(`User with id "${createMessageDto.toUser}" doesn't exist!`);
    try {
      return await this.messageRepository.save(message);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    let message = this.mapper.map(updateMessageDto, UpdateMessageDto, Message);
    try {
      return await this.messageRepository.update(id, message);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    try {
      return await this.messageRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
