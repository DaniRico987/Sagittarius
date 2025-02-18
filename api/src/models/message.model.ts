import { model } from 'mongoose';
import { MessageSchema } from '../schemas/message.schema';

export const Message = model('Message', MessageSchema);
