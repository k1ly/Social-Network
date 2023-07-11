import { AutoMap } from "@automapper/classes";

export class UserDto {
  @AutoMap()
  id: number;

  @AutoMap()
  login: string;

  @AutoMap()
  name: string;

  @AutoMap()
  email: string;

  @AutoMap()
  blocked: boolean;

  @AutoMap()
  role: string;
}