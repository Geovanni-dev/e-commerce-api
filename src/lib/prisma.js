const {PrismaClient} = require('@prisma/client') // importando o Prisma Client

const prisma = new PrismaClient(); // criando uma instância do Prisma Client

module.exports = prisma; // exportando o prisma