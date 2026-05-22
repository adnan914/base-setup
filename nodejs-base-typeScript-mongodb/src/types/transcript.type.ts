
import { Types, Document } from "mongoose";

export interface TranscriptDocument extends Document {
    _id: Types.ObjectId;
    audioUrl: string;
    transcription: string;
    createdAt: Date;
}


export interface TranscriptInput {
    audioUrl: string;
}

export interface TranscriptListInput {
    limit: 10,
    page: 1,
    search: ''
}
