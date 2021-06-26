import { Users } from '@prisma/client';
import {Response} from 'express';


type response = Users
                | { user: Users, accessToken: string }
                | null;

export const resMiddleware = (res:Response, data: response | Partial<response> | response[] | Partial<response>[], success: Boolean, status: Number, errMessage?: string, retry?: boolean) => {
    res.send({
        data: data,
        success: success,
        statusCode: status,
        errorMessage: errMessage ? errMessage : '',
        retry: retry
    })   
}