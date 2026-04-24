// Importa o Nodemailer, biblioteca usada para envio de emails no Node.js
const nodemailer = require("nodemailer"); 

//===========================================fuçoes do serviço de email

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

// funcao assincrona para enviar o email
const emailCode = async (email, subject, message) => {
    try {
        await transport.sendMail({ // metado do transporte para enviar o email
            from:` "Equipe E-commerce" <${process.env.MAIL_USER}>`,  // remetente 
            to: email, // destinatario
            subject: subject, // assunto
            text: message, // mensagem
        });
        console.log("Código enviado com sucesso"); // imprimindo o email enviado com sucesso    
    } catch (error) {
    console.error("Erro no serviço de e-mail:", error);
    throw error; // Deixa o Controller pegar o erro e responder ao usuário
}
};

module.exports = { emailCode, generateCode }