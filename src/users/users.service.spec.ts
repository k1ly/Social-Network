import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AutomapperModule } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "../roles/roles.module";
import { UsersService } from "./users.service";
import { Role } from "../roles/entities/role.entity";
import { User } from "./entities/user.entity";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("UsersService", () => {
  let service: UsersService;

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
        TypeOrmModule.forFeature([Role, User]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        RolesModule],
      providers: [UsersService]
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all users with pagination", async () => {
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      let [users, total] = await service.findAll(pageable);
      expect(users).toBeDefined();
      expect(total).toBeGreaterThanOrEqual(0);
      expect(users.length).toBeLessThanOrEqual(pageable.size);
      expect(users.length).toBeLessThanOrEqual(total);
    });

    it("should throw an InternalServerErrorException on error", async () => {
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      jest.spyOn(service["usersRepository"], "findAndCount").mockRejectedValueOnce(new Error("Database connection failed"));
      await expect(service.findAll(pageable)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("findByFilter", () => {
    it("should return users by filter with pagination", async () => {
      let filter = "a";
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      let [users, total] = await service.findByFilter(filter, pageable);
      expect(users).toBeDefined();
      expect(users.length).toBeLessThanOrEqual(pageable.size);
      for (let user of users) {
        expect(user.name).toMatch(filter);
      }
    });
  });
});
