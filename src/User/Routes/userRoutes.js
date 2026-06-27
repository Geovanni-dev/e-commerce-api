const express = require('express'); // importando o express
const router = express.Router(); // criando o router
const controller = require('../controllers/userController'); // importando o controller
const { authMiddleware } = require('../../middlewares/authMiddleware'); // importando o middleware
const { limiter } = require('../../middlewares/rateLimit'); // importando o middleware

// condição para desabilitar o rate limit durante os testes, para evitar levar block enquanto rodo os scripts
const limiterTest =
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : limiter;

//===================================== rotas do usuario

// Rota para criar um novo usuario
router.post('/register', limiterTest, controller.register);

// Rota para verificar o código de verificação
router.post('/verify-code', limiterTest, controller.verifyCode);

// Rota de login
router.post('/login', limiterTest, controller.login);

// Rota para listar todos os usuarios
router.get('/users', authMiddleware, controller.listAllUsers);

// Rota para listar um usuario por id
router.get('/users/:id', authMiddleware, controller.listUserById);

// Rota para deletar um usuario por id
router.delete('/users/:id', authMiddleware, controller.deleteUser);

// rota pra solicitar um reset de senha
router.post('/reset-password', limiterTest, controller.forgetPassword);

// rota pra resetar a senha
router.post('/reset-password/:token', limiterTest, controller.resetPassword);

module.exports = router; // exportando o router
