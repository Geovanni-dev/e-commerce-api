const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controllers/cartController"); // importando o controller

// importando o middleware
const { authMiddleware } = require("../../middlewares/authMiddleware");

// rotas do carrinho

// Rota para criar um novo carrinho
router.post("/item", authMiddleware, controller.addItemCart);

// Rota para vizu carrinho
router.get("/", authMiddleware, controller.listCart);

// rota para editar a quantidade de um item
router.patch("/item/:id", authMiddleware, controller.editItemCart);

//Rota para deletar um item
router.delete("/item/:id", authMiddleware, controller.removeItemCart);

module.exports = router; // exportando o router