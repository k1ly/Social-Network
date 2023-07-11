import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Mapper } from "@automapper/core";
import { AutomapperModule, getMapperToken } from "@automapper/nestjs";
import { classes } from "@automapper/classes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { RolesModule } from "../roles/roles.module";
import { AbilityService } from "../auth/ability/ability.service";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersProfile } from "./users.profile";
import { RolesNames } from "../roles/roles.names";
import { Role } from "../roles/entities/role.entity";
import { User } from "./entities/user.entity";
import { UserDto } from "./dto/user.dto";
import { Pageable } from "../util/pagination/pagination.pageable";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;
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
        TypeOrmModule.forFeature([Role, User]),
        AutomapperModule.forRoot({
          strategyInitializer: classes()
        }),
        AuthModule,
        RolesModule],
      controllers: [UsersController],
      providers: [UsersService, UsersProfile]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    abilityService = module.get<AbilityService>(AbilityService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated users data when no filter is provided", async () => {
      let filter = "";
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [users, total] = await usersService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(users, User, UserDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(filter, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should return paginated users data when filter is provided", async () => {
      let filter = "a";
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Admin;
      let [users, total] = await usersService.findByFilter(filter, pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(true);
      let expectedResponse = {
        content: mapper.mapArray(users, User, UserDto),
        total: Math.ceil(total / pageable.size),
        pageable
      };
      let result = await controller.findAll(filter, pageable, auth);
      expect(result).toEqual(expectedResponse);
    });

    it("should throw a ForbiddenException if users authorization fails", async () => {
      let filter = "";
      let pageable: Pageable<User> = {
        page: 0,
        size: 10,
        sort: "name",
        order: "desc"
      };
      let auth = new UserDto();
      auth.role = RolesNames.Guest;
      let [users] = await usersService.findAll(pageable);
      jest.spyOn(abilityService, "authorize").mockReturnValue(false);
      if (users.length > 0)
        await expect(controller.findAll(filter, pageable, auth)).rejects.toThrow(ForbiddenException);
    });
  });
});
