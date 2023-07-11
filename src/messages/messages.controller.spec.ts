import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Mapper } from "@automapper/core";
import { AutomapperModule, getMapperToken } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { AbilityService } from "../auth/ability/ability.service";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { MessagesProfile } from "./messages.profile";
import { RolesNames } from "../roles/roles.names";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Message } from "./entities/message.entity";
import { UserDto } from "../users/dto/user.dto";
import { MessageDto } from "./dto/message.dto";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("MessagesController", () => {
  let controller: MessagesController;
  let messagesService: MessagesService;
  let abilityService: AbilityService;
  let mapper: Mapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: configService => ({
            type: configService.get("DB_TYPE"),
            host: configService.get("DB_HOST"),
            port: Number(configService.get("DB_PORT")),
            username: configService.get("DB_USERNAME"),
            password: configService.get("DB_PASSWORD"),
            database: configService.get("DB_DATABASE"),
            autoLoadEntities: true,
            extra: { trustServerCertificate: true }
          })
        }),
        TypeOrmModule.forFeature([Role, User, Message]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        AuthModule,
        RolesModule,
        UsersModule],
      controllers: [MessagesController],
      providers: [MessagesService, MessagesProfile]
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    messagesService = module.get<MessagesService>(MessagesService);
    abilityService = module.get<AbilityService>(AbilityService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated messages data when no users are provided", async () => {
      let user = 0;
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [messages, total] = await messagesService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(messages, Message, MessageDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(user, user, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should return paginated messages data when users are provided", async () => {
      let user = 1;
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [messages, total] = await messagesService.findByUsers(user, user, pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(messages, Message, MessageDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(user, user, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw a ForbiddenException if messages authorization fails", async () => {
      let user = 0;
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Guest;
      let [messages] = await messagesService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(false);
      if (messages.length > 0)
        await expect(controller.findAll(user, user, pageable, auth)).rejects.toThrow(ForbiddenException);
    });
  });
});
