const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controllers/userController"); // importando o controller
const { authMiddleware } = require("../../middlewares/authMiddleware");// importando o middleware
const e = require("express");


// Rota para criar um novo usuario
router.post("/register", controller.register);

// Rota para verificar o código de verificação
router.post("/verify-code", controller.verifyCode); 

// Rota de login
router.post("/login", controller.login);

// Rota para listar todos os usuarios
router.get("/users", authMiddleware, controller.listAllUsers);

// Rota para listar um usuario por id
router.get("/users/:id", authMiddleware, controller.listUserById);

// Rota para deletar um usuario por id
router.delete("/users/:id", authMiddleware, controller.deleteUser);

// rota pra solicitar um reset de senha
router.post("/reset-password", controller.forgetPassword);

// rota pra resetar a senha
router.post("/reset-password/:token", controller.resetPassword);


module.exports = router; // exportando o router