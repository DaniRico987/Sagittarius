export interface Message {
  _id?: string;
  sender_id: any; // Can be string or populated User object
  receiver_id?: string;
  conversation_id?: string;
  content: string;
  timestamp?: Date;
}
