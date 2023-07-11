import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AutomapperModule } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { MessagesService } from "./messages.service";
import { Role } from "../roles/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { Message } from "./entities/message.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("MessagesService", () => {
  let service: MessagesService;

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
        RolesModule,
        UsersModule],
      providers: [MessagesService]
    }).compile();
    service = module.get<MessagesService>(MessagesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all messages with pagination", async () => {
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      let [messages, total] = await service.findAll(pageable);
      expect(messages).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(0);
      expect(messages.length).toBeLessThanOrEqual(pageable.size);
      expect(messages.length).toBeLessThanOrEqual(total);
    });

    it("should throw an InternalServerErrorException on error", async () => {
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["messageRepository"], "findAndCount").mockRejectedValueOnce(new Error("Database connection failed"));
      await expect(service.findAll(pageable)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("findByAuthor", () => {
    it("should return messages by users with pagination", async () => {
      let user = new User();
      user.id = 1;
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["usersService"], "findById").mockResolvedValueOnce(user);
      let [messages, total] = await service.findByUsers(user.id, user.id, pageable);
      expect(messages).toBeDefined();
      expect(messages.length).toBeLessThanOrEqual(pageable.size);
      for (let message of messages) {
        expect(message.fromUser.id).toBe(user.id);
        expect(message.toUser.id).toBe(user.id);
      }
    });

    it("should throw a BadRequestException if users do not exist", async () => {
      let user = new User();
      user.id = 1;
      let pageable: Pageable<Message> = {
        page: 0,
        size: 10,
        sort: "date",
        order: "desc"
      };
      jest.spyOn(service["usersService"], "findById").mockResolvedValueOnce(null);
      await expect(service.findByUsers(user.id, user.id, pageable)).rejects.toThrow(BadRequestException);
    });
  });
});
