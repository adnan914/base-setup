import { TranscriptInput, TranscriptListInput } from '@/types';
import Joi from 'joi';

export const transcriptSchema: Joi.ObjectSchema<TranscriptInput> = Joi.object({
    audioUrl: Joi.string().required()
});

export const transcriptListSchema: Joi.ObjectSchema<TranscriptListInput> = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    search: Joi.string().allow(null).allow('')
});

