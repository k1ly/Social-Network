import { AutoMap } from "@automapper/classes";
import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsPositive, MaxLength } from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty()
  @MaxLength(200)
  @AutoMap()
  text: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @AutoMap()
  post: number;

  @IsOptional()
  @IsEmpty()
  @AutoMap()
  author: number;
}
