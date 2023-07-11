import { AutoMap } from "@automapper/classes";
import { IsEmail, IsNotEmpty, IsOptional, Length, Matches, MaxLength } from "class-validator";

export class UpdateUserDto {
  @IsNotEmpty()
  @Length(4, 40)
  @Matches(/^[a-zA-Z]+([\. "-][a-zA-Z]+)*$/)
  @AutoMap()
  name: string;

  @IsOptional()
  @MaxLength(40)
  @IsEmail()
  @AutoMap()
  email: string;
}
