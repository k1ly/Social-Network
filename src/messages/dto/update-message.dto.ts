import { AutoMap } from "@automapper/classes";
import { IsNotEmpty, MaxLength } from "class-validator";

export class UpdateMessageDto {
  @IsNotEmpty()
  @MaxLength(500)
  @AutoMap()
  text: string;
}
