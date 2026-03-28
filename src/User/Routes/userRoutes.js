const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controllers/userController"); // importando o controller

const { authMiddleware } = require("../../middlewares/authMiddleware");// importando o middleware


// Rota para criar um novo usuario
router.post("/register", controller.register);

router.get("/users", authMiddleware, controller.listAllUsers);

router.get("/users/:id", authMiddleware, controller.listUserById);

router.delete("/users/:id", authMiddleware, controller.deleteUser);

module.exports = router; // exportando o router