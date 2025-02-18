import { model } from 'mongoose';
import { UserSchema } from '../schemas/user.schema';

export const User = model('User', UserSchema);
