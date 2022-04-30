import asyncHandler from 'express-async-handler';
import { getAll, getById } from '../services/users.service.js';
import { resMiddleware } from '../middleware/resMiddleware.js';

export default class UserController {
    
    // get all users
    getUsers = asyncHandler(async(req, res) => {
        try {
            const users = await getAll()
                
            return resMiddleware(res, users, true, 200);
        } catch(error) {
            return resMiddleware(res, null, false, 400, error.message);
        }
    });

    // get user by id
    getUserById = asyncHandler(async(req, res) => {
        try {
            //if user id match param id send user else throw error
            const user = await getById(req.params.id);

            return resMiddleware(res, user, true, 200);
        } catch(error) {
            return resMiddleware(res, null, false, 400, error.message);
        }
    });

    
}