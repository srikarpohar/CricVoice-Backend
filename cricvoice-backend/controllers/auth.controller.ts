import asyncHandler from 'express-async-handler';
import { createUser, getByUsername, updateRefreshToken, getByRefreshToken, createProfilePicAttachmentForUser } from '../services/auth.service.js';
import { resMiddleware } from '../middleware/resMiddleware.js';
import jwt from 'jsonwebtoken';
import bcrypt_lib from 'bcrypt';
import { v4 } from 'uuid';
import { secret, authTokenExpiry, authRefreshTokenExpiry, assetsPath } from '../config/auth.config.js';
import RedisUtils from '../utils/redisUtils.js';
import { CONSTANTS } from '../constants.js';
import { Users } from '@prisma/client';
import { initializeMulter } from '../utils/fileUploadUtils.js';
import fs from 'fs-extra';
import { onUploadMiddleware } from '../middleware/onUploadMiddleware.js';

const { compare, hash } = bcrypt_lib;
const { sign } = jwt;

export default class AuthController {
    redisUtil: RedisUtils

    constructor() {
        this.redisUtil = new RedisUtils();
    }

    // sign up user constroller
    signUpUser = asyncHandler(async (req, res) => {
        try {
            const saltRounds = 5;
            req.body.password = await hash(req.body.password, saltRounds);
            // const inputData = {...req.body, profilePicType: req.file.mimetype, profilePicName: req.file.filename, };
            createUser(req.body).then((user:Users) => {
                return resMiddleware(res, user, true, 200);
            }).catch(error => {
                return resMiddleware(res, null, false, 500, error.message);
            });
        } catch(error) {
            resMiddleware(res, null, false, 500, error.message);
            return;
        }
    });

    uploadProfilePic = asyncHandler( async(req, res) => {

        const onProfilePicUpload = (err) => {
            if (err) {
                return resMiddleware(res, null, false, 500, err.message);
            }
        
            var dir = req.body.id;
            var filename = req.file.filename;
        
            fs.move(assetsPath + '/' + filename, assetsPath + '/' + dir + '/' + filename, function (err) {
                if (err) {
                    return resMiddleware(res, null, false, 500, err.message);
                }
                
                fs.remove(assetsPath + '/' + filename, async function(err) {
                    if(err) {
                        return resMiddleware(res, null, false, 500, err.message);
                    }
                    const user = await createProfilePicAttachmentForUser(dir, '/' + dir + '/' + filename, filename, req.file.mimetype)
                    return resMiddleware(res, user, true, 200);
                })
            });
        }

        onUploadMiddleware('profilePic', req, res, onProfilePicUpload);
    })

    // sign in user controller
    signInUser = asyncHandler(async (req, res) => {
        try {
            getByUsername(req.query.username).then(async (user) => {
                if (!user) {
                    resMiddleware(res, null, false, 500, 'User not found!');
                    return;
                }
    
                // check if password matches with thats in db.
                const isPasswordValid = await compare(req.query.password, user.password);
                if (!isPasswordValid) {
                    resMiddleware(res, null, false, 500, 'Invalid Password!');
                    return;
                }
    
                // create an access token based on the user id.
                const token = sign({ id: user.id }, secret, {
                    expiresIn: parseInt(authTokenExpiry as string)
                });
    
                // create a refresh token.
                const expiredDate = new Date();
                expiredDate.setSeconds(expiredDate.getSeconds() + parseInt(authRefreshTokenExpiry as string));
                const refreshToken = v4();
                try {
                    // update refresh token in db.
                    let updatedUser = await updateRefreshToken({ user_id: user.id, refreshToken: refreshToken, expiryDate: expiredDate.getTime() });
                    res.cookie(CONSTANTS.REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
                        signed: true,
                        path: '/',
                        expires: new Date(expiredDate.getTime()),
                        httpOnly: true,
                        secure: process.env.NODE_ENV == 'production'? true: false,
                        sameSite: 'strict'
                    });
                    resMiddleware(res, { user: updatedUser, accessToken: token }, true, 200);
                    return;
                } catch (error) {
                    resMiddleware(res, null, false, 400, error.message);
                    return;
                }
    
            }).catch(error => resMiddleware(res, null, false, 400, error.message));
        } catch(error) {
            resMiddleware(res, null, false, 400, error.message);
            return;
        }
    });

    // controller for refresh token api( to check and generate new refresh token and give new access token)
    refreshToken = asyncHandler(async (req, res) => {
        try {
            // get refresh token from signed cookies from the request.
            const requestToken:string = req.signedCookies[CONSTANTS.REFRESH_TOKEN_COOKIE_KEY];
            if (!requestToken) {
                resMiddleware(res, null, false, 403, "Refresh token is required!");
                return;
            }

            // check if refresh token is blacklisted or not.
            const result:string[] = await this.redisUtil.getData(CONSTANTS.BLACKLISTED_TOKENS_KEY);
            if(result && result.indexOf(requestToken) > -1) {
                resMiddleware(res, null, false, 403, "Refresh token was expired. Please make a new signin request");
                return;
            }

            // get the user based on the refresh token and handle user not exists condition
            let user = await getByRefreshToken(requestToken);
            if (!user) {
                resMiddleware(res, null, false, 403, "Refresh token invalid!");
                return;
            }

            // check for token expiration. If token expires, prompt user to login again.
            const isTokenExpired = (user.refreshToken["web"]["expiryDate"] < new Date().getTime());
            if (isTokenExpired) {
                user = await updateRefreshToken({ user_id: user.id, refreshToken: '', expiryDate: 0 });
                resMiddleware(res, null, false, 401, "Refresh token was expired. Please make a new signin request", false);
                return;
            }

            // create a new access token and update it in db.
            const newAccessToken = sign({ id: user.id }, secret, {
                expiresIn: parseInt(authTokenExpiry as string) 
            });
            resMiddleware(res, { user: user, accessToken: newAccessToken }, true, 200);
        } catch (error) {
            resMiddleware(res, null, false, 403, error.message);
            return;
        }
    });

    logoutUser = asyncHandler(async (req, res) => {
        try {
            const requestToken:string = req.signedCookies[CONSTANTS.REFRESH_TOKEN_COOKIE_KEY];
            await updateRefreshToken({ user_id: req.body.id, refreshToken: '', expiryDate: 0 });
            await this.redisUtil.setData(CONSTANTS.BLACKLISTED_TOKENS_KEY, requestToken);
            return resMiddleware(res, { user: null, accessToken: '' }, true, 200);
        } catch (error) {
            resMiddleware(res, null, false, 403, error.message);
            return;
        }
        
    })
}