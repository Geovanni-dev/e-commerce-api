const prisma = require("../../lib/prisma"); // importando o prisma
const { z } = require("zod"); // importando o zod
const bcryptjs = require("bcryptjs"); // importando o bcryptjs
const jwt = require("jsonwebtoken"); // importando o jwt
const { emailCode, generateCode } = require("../../services/emailService"); // importando o emailService

//================================= esquemas de validação do zod

// esquema de validação do usuario
const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// esquema de validação do login
const authSchema = z.object({
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

// esquema de validação da query
const queryUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(["ADMIN", "CLIENT"]).optional(),
});

// esquema de validação do id
const idSchema = z.preprocess((val) => Number(val), z.number().int().positive("ID inválido"));


// esquema de validação do codigo de verificação
const verifyCodeSchema = z.object({
    code: z.string().min(6, "O código deve ter pelo menos 6 caracteres"),
    email: z.string().email({ message: "O email deve ser valido" }),
})

// esquema de validação do esqueci minha senha
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "O email deve ser valido" }),
})


// esquema de validação da troca de senha
const resetPasswordSchema = z.object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})



//================================= funçoes do usuario



// funcao assincrona para criar um novo usuario
const register = async (req, res) => {
    try {
        const { email, name, password} = userSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod 
        const code = generateCode(); // gerando o codigo
        const passwordHash = await bcryptjs.hash(password, 10); // criptografando a senha
        const user = await prisma.user.create({ // criando o usuario
            data: {
                name,
                email,
                password: passwordHash,
                verificationCode: code,
            },
        });
        await emailCode(user.email, //função para enviar o email com o codigo de verificação
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


// funcao assincrona para verificar o codigo
const verifyCode = async (req, res) => {
    try {
        const { email, code } = verifyCodeSchema.parse(req.body); // variavel que recebe o codigo validado
        const user = await prisma.user.findFirst({ // buscando o usuario no banco de dados
            where: {
                email, 
                verificationCode: code } // recebe o codigo validado
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(404).json({ error: "Codigo invalido ou e-mail não encontrado" });
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
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao verificar o codigo' });
    }
};


// funcao assincrona para logar o usuario
const login = async (req, res) => {
    try {
        const { email, password} = authSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        const user = await prisma.user.findUnique({ // buscando o usuario no banco de dados
            where: { email } // recebe o email validado
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        const passwordValid = await bcryptjs.compare( password, user.password); /* comparando a senha digitada com a senha do banco de dados*/
        if (!passwordValid) { // se a senha n for igual
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        if (!user.verified) { // se o usuario n for verificado
            return res.status(403).json({ error: 'Verifique seu email antes de fazer loguin'});
        }
        delete user.password; // deletando a senha do usuario para n ser impressa
        const userWithoutPassword = user; // variavel que recebe o usuario sem a senha
        const secret = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1d'}); // criando o token
        res.json({userWithoutPassword, secret}); // imprimindo o usuario sem a senha
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
    }     
       if (error.code === 'P2002') { // se o erro for do prisma, indicando que o email ja existe no banco de dados
            return res.status(409).json({ error: 'Email ja cadastrado' }); // retorna uma resposta de erro indicando que o email ja existe
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: 'Erro ao logar o usuario' });
    }
};


// funcao assincrona para listar os usuarios
const listAllUsers = async (req, res) => { 
    try {
    const { name, email, role } = queryUserSchema.parse(req.query); // variavel que recebe os dados validados pelo esquema do zod
    const users = await prisma.user.findMany({ // buscando os usuarios no banco de dados
        where: { // filtrando os usuarios
            name: name ? {
                contains: name, // contains serve pra buscas parciais
                mode: "insensitive" } : undefined, // serve para n diferenciar maiusculas e minusculas
            email, 
            role
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
    }
};


// funcao assincrona para listar um usuario pelo id
const listUserById = async (req, res) => { 
    try {
        const { id } = idSchema.parse(req.params); // variavel que recebe o id validado
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
        res.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
            });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Usuario n encontrado' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao deletar o usuario' });
    }
}

// funcao assincrona para solicitar a troca de senha
const forgetPassword = async (req, res) => { // funcao assincrona para esquecer a senha
    try {
    const { email } = forgotPasswordSchema.parse(req.body); // variavel que recebe o email validado
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { // Se o usuário nao for encontrado, retorna um erro
    return res.status(200).json({
        message: "Se o email estiver cadastrado, um link de recuperação será enviado."
    });
    }
    const resetToken = crypto.randomBytes(32).toString("hex"); // Gera um token aleatório
    const resetTokenExpiration = new Date(Date.now() + 3600000); // define o tempo de expiracao do token
    await prisma.user.update({ where: { email }, 
        data: { resetPasswordToken: resetToken,
            resetTokenExpiration: resetTokenExpiration } 
        });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // cria o link de recuperação
    try {
        await emailCode ( email, "Recuperação de senha", `Clique no link para recuperar sua senha: ${resetLink}`); // envia o email com o link de recuperação
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Erro ao enviar o email" });
    }
    res.json({ message: "Link de recuperação enviado com sucesso" 
    
    });
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
            });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao solicitar a recuperação de senha' });
    }
};


// funçao assincrona para trocar a senha
const resetPassword = async (req, res) => { // funcao assincrona para trocar a senha
    try {
    const { password } = resetPasswordSchema.parse(req.body); // variavel que recebe as senhas validadas
    const { resetToken } = req.params; // variavel que recebe o token validado
    const user = await prisma.user.findUnique({ where: {
        resetPasswordToken: resetToken, 
        resetTokenExpiration: { gt: new Date() } 
        } 
        }); 
    if (!user) { // Se o usuário nao for encontrado, retorna um erro
        return res.status(404).json({ error: "Token de recuperação de senha inválido" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // criptografa a senha
    await prisma.user.update({ where: { resetPasswordToken: resetToken }, 
        data: { password: hashedPassword, resetPasswordToken: null, resetTokenExpiration: null } 
        });
    res.json({ message: "Senha trocada com sucesso" });
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
            });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Token de recuperação de senha inválido' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao trocar a senha' });
    }
};



module.exports = { register, verifyCode, login, listAllUsers, listUserById, deleteUser, resetPassword, forgetPassword }; // exportando as funcoes

