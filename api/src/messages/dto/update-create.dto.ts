import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  readonly sender_id?: string;

  @IsOptional()
  @IsString()
  readonly receiver_id?: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsDate()
  readonly timestamp?: Date;
}
