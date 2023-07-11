import { AutoMap } from "@automapper/classes";
import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsPositive } from "class-validator";

export class CreateLikeDto {
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
