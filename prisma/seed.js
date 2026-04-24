const {PrismaClient} = require('@prisma/client');  // importando o prisma client
const bcryptjs = require('bcryptjs'); // importando o bcryptjs
const { z } = require('zod'); // importando o zodz  

const prisma = new PrismaClient(); //criando uma instância do prisma

// esquema de validação zod do usuario
const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    role: z.enum(['ADMIN', 'CLIENT']).default('CLIENT')
});

// FUNÇÃO PARA CRIAR O USUARIO ADMIN
const createAdmin = async () => {  // funcao assincrona
    try {   
    const {name, email, password, role} = userSchema.parse({ // variavel que recebe os dados validados pelo esquema do zod
            name: 'Admin Segundario',
            email: 'admin122@example.com',
            password: 'Admin123',
            role: 'ADMIN'
    });
    console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
    
    const passwordHash = await bcryptjs.hash(password, 10); // criptografando a senha        
    const admin = await prisma.user.upsert({ // adicionando os dados ao banco de dados
        where: { email },// recebe o email validado
        update: {},
        create: { // criando o admin
                name,
                email,
                password: passwordHash,
                role
        }
    });
console.log(`Admin criado/verificado com sucesso:${admin.email}`); // imprimindo o admin criado
}  catch (error) { // tratando o erro
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        } else { // se n for do zod
            console.error("Erro no Prisma:", error);
        }
} finally {
            await prisma.$disconnect(); // desconectando do banco de dados
        }
};

createAdmin(); // chamando a funcao

