const jwt = require("jsonwebtoken"); // biblioteca usada para validar o token
const prisma = require("../lib/prisma"); // importando o prisma

const SECRET = process.env.JWT_SECRET; // chave secreta usada para validar o token

// funçao assincrona para validar o token
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers; // pegando o token do header da requisicao
  if (!authorization) {
    return res.status(401).json({ error: "Sem autorização" });
  }
  const token = authorization.split(" ")[1]; /* O header normalmente vem no formato:
    "Bearer TOKEN_AQUI" então temos q separar o token da palavra "Bearer" com um espaço*/
  try {
    const { id } = jwt.verify(token, SECRET); // verificando o token
    const user = await prisma.user.findUnique({ where: { id } }); // buscando o usuario no banco de dados
    if (!user) {
      return res.status(401).json({ error: "Token invalido" });
    }
    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acesso apenas para administradores" });
    }
    req.user = user; // armazenando o usuario na requisicao
    next(); // passando para o proximo middleware
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Token invalido" });
  }
};

module.exports = { authMiddleware };
