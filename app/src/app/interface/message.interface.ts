export interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp?: Date;
}
