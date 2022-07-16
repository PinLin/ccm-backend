import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(3)
  username: string;
}
