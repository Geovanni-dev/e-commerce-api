// Importa o Nodemailer, biblioteca usada para envio de emails no Node.js
const nodemailer = require("nodemailer"); 

// Importa o Zod, biblioteca usada para validação de dados
const { z } = require("zod");

// esquema de validação do email
const validEmailSchema = z.object({
    email: z.string().email({ message: "O email deve ser valido" }),
    subject: z.string().min(3, "O assunto deve ter pelo menos 3 caracteres"),
    message: z.string().min(3, "A mensagem deve ter pelo menos 3 caracteres"),
})

const validCodeSchema = z.object({
    code: z.string().min(6, "O código deve ter pelo menos 6 caracteres"),
})


// funçao para gerar o codigo
const generateCode = () => {
const caracters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let Codigo = '';
    for (let i = 0; i < 6; i++) {
        Codigo += caracters.charAt(Math.floor(Math.random() * caracters.length));
    }
    return Codigo;
}


// configurando o transporte
const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST, 
    port: Number(process.env.MAIL_PORT),
    secure: true, // true para 465, false para outras portas
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// funcao assincrona para enviar o email (validado pelo esquema zod)
const emailCode = async (email, subject, message) => {
    try {
        const validatedEmail = validEmailSchema.parse({email, subject, message}); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        await transport.sendMail({ // metado do transporte para enviar o email
            from:` "Equipe E-commerce" <${process.env.MAIL_USER}>`,  // remetente 
            to: validatedEmail.email, // destinatario
            subject: validatedEmail.subject, // assunto
            text: validatedEmail.message, // mensagem
        });
        console.log("Código enviado com sucesso"); // imprimindo o email enviado com sucesso    
    } catch (error) {
    console.error("Erro no serviço de e-mail:", error);
    throw error; // Deixa o Controller pegar o erro e responder ao usuário
}
};


const validCode = async (code) => {
    try {
        const validatedCode = validCodeSchema.parse({code}); // variavel que recebe os dados validados pelo esquema do zod
        console.log("Dados validados pelo esquema do zod: "); // imprimindo os dados validados pelo esquema do zod
        return validatedCode.code; // imprimindo o codigo validado
    } catch (error) {
    console.error("Erro no serviço de e-mail:", error);
    throw error; // Deixa o Controller pegar o erro e responder ao usuário
    }
};

module.exports = { emailCode, generateCode , validCode }    
