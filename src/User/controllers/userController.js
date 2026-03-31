const prisma = require("../../lib/prisma"); // importando o prisma
const emailService = require("../../services/emailService"); // importando o emailService
const { z } = require("zod"); // importando o zod
const bcryptjs = require("bcryptjs"); // importando o bcryptjs
const jwt = require("jsonwebtoken"); // importando o jwt
const {emailCode, generateCode, validCode} = require("../../services/emailService"); // importando o emailService


// esquema de validação do usuario
const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// esquema de validação da query
const queryUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(["ADMIN", "CLIENT"]).optional(),
});

// esquema de validação do id
const idSchema = z.preprocess((val) => Number(val), z.number().int().positive("ID inválido"));

// esquema de validação do login
const loguinSchema = z.object({
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// esquema de validação do codigo
const verifyCodeSchema = z.object({
    code: z.string().min(6, "O código deve ter pelo menos 6 caracteres"),
})


// funcao assincrona para criar um novo usuario
const register = async (req, res) => {
    try {
        const validatedUser = userSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod 
        const code = generateCode(); // gerando o codigo
        const password = await bcryptjs.hash(validatedUser.password, 10); // criptografando a senha
        const user = await prisma.user.create({ // criando o usuario
            data: {
                name: validatedUser.name,
                email: validatedUser.email,
                password: password,
                verificationCode: code,
            },
        });
        await emailService.emailCode(user.email, //função para enviar o email com o codigo de verificação
            "Confirme seu cadastro",
            `Seu código de verificação é: ${code}`);  
        res.status(201).json({message: "Usuario criado! Verifique seu e-mail"}); // imprimindo o usuario criado
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao criar o usuario" });
    }
}

// funcao assincrona para listar os usuarios
const listAllUsers = async (req, res) => { 
    try {
    const validatedQuery = queryUserSchema.parse(req.query); // variavel que recebe os dados validados pelo esquema do zod
    const users = await prisma.user.findMany({ // buscando os usuarios no banco de dados
        where: { // filtrando os usuarios
            name: validatedQuery.name ? {
                contains: validatedQuery.name, // contains serve pra buscas parciais
                mode: "insensitive" } : undefined, // serve para n diferenciar maiusculas e minusculas
            email: validatedQuery.email, 
            role: validatedQuery.role,
        },
        select: { // selecionando os dados dos usuarios
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
    res.json(users); // imprimindo os usuarios
    }catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao listar os usuarios" });
    };
};


// funcao assincrona para listar um usuario pelo id
const listUserById = async (req, res) => { 
    try {
        const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
        const user = await prisma.user.findUnique({ // buscando o usuario no banco de dados
            where: { id }, // recebe o id validado
            select: { // selecionando os dados do usuario
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(404).json({ error: "Usuario n encontrado" });
        }
        res.json(user); // imprimindo o usuario
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao listar o usuario" });
    }
}


// funcao assincrona para deletar um usuario
const deleteUser = async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
        const user = await prisma.user.delete({ // deletando o usuario
            where: { id }
        });
        res.json(user)
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: error.errors[0].message });
        }
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao deletar o usuario' });
    }
};


// funcao assincrona para verificar o codigo
const verifyCode = async (req, res) => {
    try {
        const { email, code } = verifyCodeSchema.parse(req.body); // variavel que recebe o codigo validado
        validCode(code);
        const user = await prisma.user.findFirst({ // buscando o usuario no banco de dados
            where: {
                email: email, 
                verificationCode: code } // recebe o codigo validado
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(404).json({ error: "Codigo n encontrado" });
        }
        await prisma.user.update({ // impede que o codigo seja usado mais de uma vez
            where: { id: user.id },
            data: { verificationCode: null, verified: true }, 
        });
        res.json({ message: "Codigo verificado com sucesso" });
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Codigo n encontrado' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao verificar o codigo' });
    }
};


module.exports = { register , listAllUsers,listUserById, deleteUser, verifyCode }; // exportando as funcoes

