import jwt from 'jsonwebtoken';
import { secret } from '../config/auth.config.js';
import { resMiddleware } from './resMiddleware.js';

const { verify, TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
      return resMiddleware(res, null, false, 401, "Unauthorized! Access Token was expired!", true);
    }
  
    return resMiddleware(res, null, false, 401, "Unauthorized!");
}

export const verifyToken = (req, res, next) =>{
    try {
        // TODO: write logic for retrieving token based on device.
        const token = req.headers['authorization'].split(' ').length > 1 ? req.headers['authorization'].split(' ')[1] : '';
        if(!token) {
            return resMiddleware(res, null, false, 401, "No authentication token provided!");
        }

        verify(token, secret, (err, decoded) => {
            console.log(err);
            if (err) {
                return catchError(err, res);
            }
            req.body.userid = decoded.id;
            next();
        });
    } catch(error) {
        return resMiddleware(res, null, false, 401, error.message);
    }
}