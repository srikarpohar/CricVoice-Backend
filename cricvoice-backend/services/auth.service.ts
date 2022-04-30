import prismaClient from '../config/db.config.js';
import { Users } from '@prisma/client';

export const createUser = async (data: Users) => {
    const user = await prismaClient.users.create({
        data: data
    });
    return user;
};

export const createProfilePicAttachmentForUser = async (id: string, url: string, filename: string, filetype: string) => {
    const attachment = await prismaClient.attachment.create({
        data: {
            url: url,
            filename: filename,
            filetype: filetype
        }
    })
    const user = await prismaClient.users.update({
        where: {
            id: id
        }, 
        data: {
            profilePic: attachment.id
        },
        include: {
            profilePicRel: true
        }
    });
    return user;
}

export const getByUsername = async (username: string) => {
    const user = await prismaClient.users.findUnique({
        where: {
            username: username
        },
        include: {
            preference: true,
            profilePicRel: true
        }
    });
    return user;
};

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
    },
    include: {
        preference: true
    }
});

export const getByRefreshToken = (token: string) => prismaClient.users.findFirst({
    where: {
        refreshToken: {
            path: ['web', 'token'],
            equals: token
        }
    },
    include: {
        preference: true,
        profilePicRel: true
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
        },
        include: {
            preference: true,
            profilePicRel: true
        }
    })
}
