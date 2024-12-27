import * as Joi from 'joi';
export const configValidationSchema = Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    STAGE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
}); 