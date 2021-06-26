import { getByUsernameOrEmail }  from '../services/auth.service.js';
import { resMiddleware } from './resMiddleware.js';

export const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const user = await getByUsernameOrEmail({ username: req.body.username, email: req.body.email });
        if (user) {
            resMiddleware(res, user, false, 400, 'Username or email already exists!');
        }
        next();
    } catch(error) {
        next();
    }
}