import { AutoMap } from "@automapper/classes";
import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class UpdatePostDto {
  @IsNotEmpty()
  @MaxLength(200)
  @AutoMap()
  text: string;

  @IsOptional()
  @MaxLength(100)
  @AutoMap()
  imageUrl: string;
}
