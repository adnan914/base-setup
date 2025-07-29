import mongoose, { Schema } from 'mongoose';
import { TokenType } from '@/enums';

const TokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: TokenType,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.JWT_REFRESH_EXPIRATION,
  },
});

export default mongoose.model('Token', TokenSchema);
