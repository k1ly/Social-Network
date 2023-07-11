import {
  Controller, Get, Post, Body, Param, Delete, Query,
  ForbiddenException, NotFoundException, Put
} from "@nestjs/common";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { ApiTags } from "@nestjs/swagger";
import { MessagesService } from "./messages.service";
import { AbilityAction } from "../auth/ability/ability.action";
import { AbilityService } from "../auth/ability/ability.service";
import { Auth } from "../auth/auth.decorator";
import { UserDto } from "../users/dto/user.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { MessageDto } from "./dto/message.dto";
import { Message } from "./entities/message.entity";
import { Pagination } from "../util/pagination/pagination.decorator";
import { Pageable } from "../util/pagination/pagination.pageable";

@ApiTags("messages")
@Controller("api/messages")
export class MessagesController {
  constructor(@InjectMapper() private readonly mapper: Mapper,
              private readonly messagesService: MessagesService,
              private readonly abilityService: AbilityService) {
  }

  @Get()
  async findAll(@Query("fromUser") fromUser: number,
                @Query("toUser") toUser: number,
                @Pagination() pageable: Pageable<Message>,
                @Auth() auth: UserDto) {
    let [messages, total] = fromUser && toUser ? await this.messagesService.findByUsers(fromUser, toUser, pageable) : await this.messagesService.findAll(pageable);
    if (messages.some(message => !this.abilityService.authorize(auth, AbilityAction.Read, message)))
      throw new ForbiddenException();
    return {
      content: this.mapper.mapArray(messages, Message, MessageDto),
      total: Math.ceil(total / pageable.size),
      pageable
    };
  }

  @Get(":id")
  async findById(@Param("id") id: number, @Auth() auth: UserDto) {
    let message = await this.messagesService.findById(id);
    if (!message)
      throw new NotFoundException(`Message with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Read, message))
      throw new ForbiddenException();
    return this.mapper.map(message, Message, MessageDto);
  }

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Auth() auth: UserDto) {
    if (!this.abilityService.authorize(auth, AbilityAction.Create, Message))
      throw new ForbiddenException();
    createMessageDto.fromUser = auth.id;
    await this.messagesService.create(createMessageDto);
  }

  @Put(":id")
  async update(@Param("id") id: number, @Body() updateMessageDto: UpdateMessageDto, @Auth() auth: UserDto) {
    let message = await this.messagesService.findById(id);
    if (!message)
      throw new NotFoundException(`Message with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Update, message))
      throw new ForbiddenException();
    await this.messagesService.update(id, updateMessageDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number, @Auth() auth: UserDto) {
    let message = await this.messagesService.findById(id);
    if (!message)
      throw new NotFoundException(`Message with id "${id}" doesn't exist!`);
    if (!this.abilityService.authorize(auth, AbilityAction.Delete, message))
      throw new ForbiddenException();
    await this.messagesService.remove(id);
  }
}
