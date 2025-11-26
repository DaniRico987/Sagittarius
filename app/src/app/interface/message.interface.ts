export interface Message {
  _id?: string;
  sender_id: any; // Can be string or populated User object
  receiver_id?: string;
  conversation_id?: string;
  content: string;
  timestamp?: Date;
  status?: 'sent' | 'delivered' | 'read';
  deliveredAt?: Date;
  readAt?: Date;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
    createdAt: Date;
  }>;
}
