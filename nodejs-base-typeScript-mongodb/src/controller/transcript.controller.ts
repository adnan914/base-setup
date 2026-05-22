import { Request, Response } from 'express';
import { MessageUtil, StatusUtil, AppError, CommonUtils } from '../utils';
import { TranscriptDocument, TranscriptInput, TranscriptListInput } from '../types';
import mongoose from 'mongoose';
import TranscriptModel from '@/models/transcript.model';

class TranscriptController {

    public async transcript(req: Request, res: Response): Promise<void> {
        const { audioUrl } = req.body as TranscriptInput;

        await CommonUtils.downloadWithRetry(audioUrl);

        const data: TranscriptDocument = await TranscriptModel.create({
            audioUrl,
            transcription: CommonUtils.generateRandomText()
        });

        res.status(StatusUtil.OK).json({ success: true, message: MessageUtil.ADD_SUCCESSFULLY, transcript: data });
    }

    public async transcriptList(req: Request, res: Response): Promise<void> {
        const { limit = 10, page = 1, search = '' } = req.query as unknown as TranscriptListInput;
        if (!limit) throw new AppError(MessageUtil.LIMIT_ZERO, StatusUtil.BAD_REQUEST);
        const skip = (page - 1) * limit;
        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: {
                    $or: [
                        { _id: mongoose.Types.ObjectId.isValid(search) ? new mongoose.Types.ObjectId(search) : null },
                        { transcription: { $regex: search, $options: 'i' } },
                        { audioUrl: { $regex: search, $options: 'i' } }
                    ]
                }
            },
            {
                $facet: {
                    data: [
                        { $sort: { _id: -1 } }, // sort first
                        { $skip: skip },       // skip docs
                        { $limit: Number(limit) },     // limit docs
                    ],
                    totalCount: [
                        { $count: 'count' },   // count total docs
                    ],
                },
            },
        ];
        const result = await TranscriptModel.aggregate<{
            data: TranscriptDocument[];
            totalCount: [{ count: number }];
        }>(pipeline);

        const data = result[0]?.data || [];
        const totalCount = result[0]?.totalCount[0]?.count || 0;

        res.status(StatusUtil.OK).json({
            success: true,
            message: MessageUtil.DATA_FOUND,
            totalCount,
            transcriptData: data,
        });
    }


}

export default new TranscriptController();