import asyncHandler from 'express-async-handler';
import { getAll, getById } from '../services/users.service.js';
import { resMiddleware } from '../middleware/resMiddleware.js';

export default class UserController {
    
    // get all users
    getUsers = asyncHandler(async(req, res) => {
        getAll().then(users => {
            resMiddleware(res, users, true, 200);
            return;
        }).catch(error => {
            resMiddleware(res, null, false, 400, error.message);
            return;
        })
    });

    // get user by id
    getUserById = asyncHandler(async(req, res) => {
        //if user id match param id send user else throw error
        getById(req.params.id).then(user => {
            resMiddleware(res, user, true, 200);
            return;
        }).catch(error => {
            resMiddleware(res, null, false, 400, error.message);
            return;
        });
    });


}