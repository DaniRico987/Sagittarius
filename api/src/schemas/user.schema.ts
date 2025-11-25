import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: false },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [
    {
      from: { type: Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    },
  ],
});

export interface User extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  friends: string[];
  friendRequests: { from: string; status: 'pending' | 'accepted' | 'rejected' }[];
}
