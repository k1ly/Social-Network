import { AutoMap } from "@automapper/classes";
import { IsNotEmpty, MaxLength } from "class-validator";

export class UpdateCommentDto {
  @IsNotEmpty()
  @MaxLength(200)
  @AutoMap()
  text: string;
}
