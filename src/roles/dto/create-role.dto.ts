import { AutoMap } from "@automapper/classes";
import { IsNotEmpty, MaxLength } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty()
  @MaxLength(30)
  @AutoMap()
  name: string;
}
