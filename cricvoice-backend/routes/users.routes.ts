import UserController from '../controllers/user.controller.js';
import express from 'express';

export default async function setUserRouter() {
    const userController = new UserController();

    const router = express.Router();

    // express router method to create route for getting all users
    router.route('/').get(userController.getUsers)

    // express router method to create route for getting users by id
    router.route('/:id').get(userController.getUserById)

    return router;
}
