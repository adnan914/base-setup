import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { JoiValidateType } from '@/enums';
import { MessageUtil } from '@/utils';

export const validateSchema = (schema: Joi.Schema, schemaType: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        let dataToValidate;

        switch (schemaType) {
            case JoiValidateType.BODY:
                dataToValidate = req.body;
                break;
            case JoiValidateType.QUERY:
                dataToValidate = req.query;
                break;
            case JoiValidateType.PARAM:
                dataToValidate = req.params;
                break;
            default:
                res.status(500).json({ message: MessageUtil.INVALID_SCHEMA_TYPE });
                return;
        }

        const { error } = schema.validate(dataToValidate);

        if (error) {
            res.status(400).json({ message: error.message, details: error.details });
        } else {
            next();
        }

    };
};
