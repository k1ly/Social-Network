import { AutoMap } from "@automapper/classes";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class BlockUserDto {
  @IsNotEmpty()
  @IsBoolean()
  @AutoMap()
  blocked: boolean;
}
