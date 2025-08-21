import express, { Router } from 'express';
import { verifyToken } from '@/middleware/verify.token.middleware';
import { validateSchema } from "@/middleware/validate.joi.middleware";
import { transcriptSchema, transcriptListSchema } from '@/joi-schema/transcript.schema';
import { JoiValidateType } from '@/enums';
import transcriptController from '@/controller/transcript.controller';
import { catchAsync } from '@/utils/catch.async.utils';

const routes: Router = express.Router();

routes.post('/transcription', verifyToken(), validateSchema(transcriptSchema, JoiValidateType.BODY), catchAsync(transcriptController.transcript));
routes.get('/transcriptionList', verifyToken(), validateSchema(transcriptListSchema, JoiValidateType.QUERY), catchAsync(transcriptController.transcriptList));

export default routes;
