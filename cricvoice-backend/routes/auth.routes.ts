import AuthController from '../controllers/auth.controller.js';
import express from 'express';
import { checkDuplicateUsernameOrEmail } from '../middleware/verifySignUp.js';

export default async function setAuthRouter() {
    const userController = new AuthController();

    const router = express.Router();

    // route for signup
    router.post('/signup', checkDuplicateUsernameOrEmail, userController.signUpUser);

    // route for uploading profilepic after signup
    router.post('/signup/upload', userController.uploadProfilePic);

    // route for sign in
    router.get('/login', userController.signInUser);

    // route for logging out user
    router.post('/logout', userController.logoutUser);

    // route for refresh token
    router.route('/refreshtoken').post(userController.refreshToken);

    return router;
}