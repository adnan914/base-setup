import mongoose, { Schema } from 'mongoose';
import { TranscriptDocument } from '@/types';

const TranscriptSchema: Schema<TranscriptDocument> = new Schema({
  audioUrl: { type: String, required: true },
  transcription: { type: String, required: true },
}, { timestamps: true });

TranscriptSchema.pre(['updateMany', 'updateOne', 'findOneAndUpdate'], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});


export default mongoose.model<TranscriptDocument>('transcript', TranscriptSchema);
