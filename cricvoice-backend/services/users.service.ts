import prismaClient from '../config/db.config.js';

export const getAll = () => prismaClient.users.findMany();

export const getById = (id:string) => prismaClient.users.findUnique({
    where: {
        id: id
    }
});
