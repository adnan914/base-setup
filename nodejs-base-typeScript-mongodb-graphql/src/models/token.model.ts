import mongoose, { Schema } from 'mongoose';
import { TokenType } from '@/enums';

const TokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: TokenType, required: true },

}, { timestamps: true });

export default mongoose.model('Token', TokenSchema);
