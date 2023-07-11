import { AutoMap } from "@automapper/classes";
import { IsEmpty, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreatePostDto {
  @IsNotEmpty()
  @MaxLength(200)
  @AutoMap()
  text: string;

  @IsOptional()
  @MaxLength(100)
  @AutoMap()
  imageUrl: string;

  @IsOptional()
  @IsEmpty()
  @AutoMap()
  author: number;
}
