import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;

const prismaClient = new PrismaClient({log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ], errorFormat: 'minimal', rejectOnNotFound: true});

prismaClient.$on('query', e => {
    console.log("Query: " + e.query)
    console.log("Duration: " + e.duration + "ms")
});

export default prismaClient;