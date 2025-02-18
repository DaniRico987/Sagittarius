export class CreateMessageDto {
  readonly sender_id: string;
  readonly receiver_id: string;
  readonly content: string;
  readonly timestamp?: Date;
}
