import { Injectable } from "@nestjs/common";
import { MappingProfile, Mapper, createMap, forMember, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { MessageDto } from "./dto/message.dto";
import { Message } from "./entities/message.entity";

@Injectable()
export class MessagesProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, Message, MessageDto,
        forMember(messageDto => messageDto.fromUser, mapFrom(message => message.fromUser?.id)),
        forMember(messageDto => messageDto.toUser, mapFrom(message => message.toUser?.id)));
      createMap(mapper, CreateMessageDto, Message);
      createMap(mapper, UpdateMessageDto, Message);
    };
  }
}