import { validateSchema } from '../middlewares/validate.joi.middleware';

export const generateMiddlewares = (config: any) => {
    const authVerify: any = {};
    const joiValidate: any = {};
    const rateLimiting: any = {};

    for (const operationType in config) {
        for (const field in config[operationType]) {

            const { auth, validate, limiting } = config[operationType][field];

            if (auth) {
                authVerify[operationType] = authVerify[operationType] || {};
                authVerify[operationType][field] = auth;
            }

            if (validate) {
                joiValidate[operationType] = joiValidate[operationType] || {};
                joiValidate[operationType][field] = validateSchema(validate);
            }

            if (limiting) {
                rateLimiting[operationType] = rateLimiting[operationType] || {};
                rateLimiting[operationType][field] = limiting;
            }
        }
    }
    return { authVerify, joiValidate, rateLimiting };
}