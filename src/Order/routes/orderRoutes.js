const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controller/orderController"); // importando o controller

// importando o middleware
const { authMiddleware } = require("../../middlewares/authMiddleware");

//=============================== rotas para pedidos

// Rota para criar um novo pedido
router.post("/", authMiddleware, controller.createOrder);

// Rota para listar todos os pedidos
router.get("/", authMiddleware, controller.listAllOrders);

// Rota para listar um pedido
router.get("/:id", authMiddleware, controller.listOrder);

module.exports = router; // exportando o router