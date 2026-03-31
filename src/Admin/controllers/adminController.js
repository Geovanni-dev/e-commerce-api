const prisma = require('../../lib/prisma'); // importando o prisma
const { z } = require('zod'); // importando o zod
const bcryptjs = require('bcryptjs'); // importando o bcryptjs
const jwt = require('jsonwebtoken'); // importando o jwt

// esquema de validação do login
const authSchema = z.object({
    email: z.string().email({ message: "O email deve ser valido" }),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});


// funcao assincrona para logar o usuario
const login = async (req, res) => {
    try {
        const validatedAuth = authSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        const user = await prisma.user.findUnique({ // buscando o usuario no banco de dados
            where: { email: validatedAuth.email } // recebe o email validado
        });
        if (!user) { // se o usuario n for encontrado
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        const passwordValid = await bcryptjs.compare(validatedAuth.password, user.password); /* comparando a senha digitada com a senha do banco de dados*/
        if (!passwordValid) { // se a senha n for igual
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        if (!user.verified) { // se o usuario n for verificado
            return res.status(403).json({ error: 'Verifique seu email antes de fazer loguin'});
        }
        const { password: _, ...userWithoutPassword } = user; // funçao para tirar a senha do usuario
        const secret = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1d'}); // criando o token
        res.json({userWithoutPassword, secret}); // imprimindo o usuario sem a senha
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: 'Erro ao logar o usuario' });
    }
};



module.exports = { login }; //'exportando a funcao