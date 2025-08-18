import { MessageUtil } from "./messages.utils";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string = MessageUtil.SOMETHING_WENT_WRONG, statusCode: number = 500) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}