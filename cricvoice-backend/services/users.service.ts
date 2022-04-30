import prismaClient from '../config/db.config.js';

export const getAll = async () => {
    const users = await prismaClient.users.findMany();
    return users;
};

export const getById = async (id:string) => {
    const user = await prismaClient.users.findUnique({
        where: {
            id: id
        }
    });
    return user;
};
