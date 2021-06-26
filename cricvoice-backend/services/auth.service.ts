import prismaClient from '../config/db.config.js';
import { Users } from '@prisma/client';

export const createUser = (data: Users) => prismaClient.users.create({
    data: data
});

export const getByUsername = (username: string) => prismaClient.users.findUnique({
    where: {
        username: username
    }
});

export const getByUsernameOrEmail = (data: { username: string, email: string }) => prismaClient.users.findFirst({
    where: {
        OR: [
            {
                username: {
                    contains: data.username
                },
            },
            {
                email: {
                    contains: data.email
                }
            }
        ]
    }
});

export const getByRefreshToken = (token: string) => prismaClient.users.findFirst({
    where: {
        refreshToken: {
            path: ['web', 'token'],
            equals: token
        }
    }
});

export const updateRefreshToken = (data: { user_id: string, refreshToken: string, expiryDate: number }) => {
    return prismaClient.users.update({
        data: {
            refreshToken: {
                "web": { "token": data.refreshToken, "expiryDate": data.expiryDate },
                "android": { "token": '', "expiryDate": '' },
                "ios": { "type": '', "expiryDate": '' }
            }
        },
        where: {
            id: data.user_id
        }
    })
}
