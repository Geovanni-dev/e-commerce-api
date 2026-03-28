const prisma = require("../../lib/prisma"); // importando o prisma
const { z } = require("zod"); // importando o zod
const bcryptjs = require("bcryptjs"); // importando o bcryptjs
const jwt = require("jsonwebtoken"); // importando o jwt

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

const deleteUserSchema = z.object({
    id: z.preprocess((val) => Number(val), z.number().int().positive("ID inválido")),
});


// funcao assincrona para criar um novo usuario
const register = async (req, res) => {
    try {
        const validatedUser = userSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        const password = await bcryptjs.hash(validatedUser.password, 10); // criptografando a senha
        const user = await prisma.user.create({ // criando o usuario
            data: {
                name: validatedUser.name,
                email: validatedUser.email,
                password: password,
            },
        });
        res.status(201).json(user); // imprimindo o usuario criado
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: error.errors[0].message });
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
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao listar os usuarios" });
    };
};


// funcao assincrona para listar um usuario pelo id
const listUserById = async (req, res) => { // funcao assincrona para listar um usuario pelo id
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
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao listar o usuario" });
    }
}



// funcao assincrona para logar o usuario
const login = async (req, res) => {
    try {
        const validatedLoguin = loguinSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        const user = await prisma.user.findUnique({ // buscando o usuario no banco de dados
            where: { email: validatedLoguin.email } // recebe o email validado
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        const passwordValid = await bcryptjs.compare(validatedLoguin.password, user.password); /* comparando a senha digitada com a senha do banco de dados*/
        if (!passwordValid) { // se a senha n for igual
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        const { password: _, ...userWithoutPassword } = user; // funçao para tirar a senha do usuario
        const secret = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1d'}); // criando o token
        res.json({userWithoutPassword, secret}); // imprimindo o usuario sem a senha
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: 'Erro ao logar o usuario' });
    }
};

// funcao assincrona para deletar um usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = deleteUserSchema.parse(req.params); // variavel que recebe o id validado
        const user = await prisma.user.delete({ // deletando o usuario
            where: { id }
        });
        res.json(user)
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: error.errors[0].message });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Usuario n encontrado' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao deletar o usuario' });
    }
};




module.exports = { register , listAllUsers,listUserById, login, deleteUser }; // exportando as funcoes

