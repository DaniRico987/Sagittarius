import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly sender_id: string;

  @IsOptional()
  @IsString()
  readonly conversation_id?: string;

  @IsOptional()
  @IsString()
  readonly receiver_id?: string;

  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @IsOptional()
  @IsDateString()
  readonly timestamp?: Date;
}
