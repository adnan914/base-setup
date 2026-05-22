import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

const imagesPath: string = './public/images/';
const pdfPath: string = './public/pdf/';

const imageStorage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: any) => {
        console.log('imagesPath', imagesPath, file);
        callback(null, imagesPath);
    },
    filename: (req: Request, file: Express.Multer.File, callback: any) => {
        const timestamp: number = Date.now();
        const randomNum: number = Math.round(Math.random() * 1E9);
        callback(null, `Profile_${timestamp}-${randomNum}-${file.originalname}`);
    },
});

const pdfStorage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: any) => {
        callback(null, pdfPath);
    },
    filename: (req: Request, file: Express.Multer.File, callback: any) => {
        const timestamp: number = Date.now();
        const randomNum: number = Math.round(Math.random() * 1E9);
        callback(null, `Profile_${timestamp}-${randomNum}-${file.originalname}`);
    },
});

const uploadImage = multer({ storage: imageStorage });
const uploadPDF = multer({ storage: pdfStorage });

export {
    uploadImage,
    uploadPDF,
};
