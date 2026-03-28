const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const authController = require("../controllers/adminController"); // importando o controller

// Rota de login
router.post("/login", authController.login);

module.exports = router; // exportando o router
