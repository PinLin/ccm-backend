import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageType } from '../enum/message.enum';

export class SendMessageDto {
  @IsString()
  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsNotEmpty()
  content: string;
}
