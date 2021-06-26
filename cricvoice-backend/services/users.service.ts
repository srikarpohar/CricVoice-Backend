import prismaClient from '../config/db.config.js';
import { Users } from '@prisma/client';

export const getAll = () => prismaClient.users.findMany();

export const getById = (id:string) => prismaClient.users.findUnique({
    where: {
        id: id
    }
});

