const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controllers/productController"); // importando o controller

// importando o middleware
const { authMiddleware } = require("../../middlewares/authMiddleware");

// Rota para criar um novo produto
router.post("/", authMiddleware, controller.createProduct);

// Rota para listar todos os produtos
router.get("/", controller.listAllProducts);

// Rota para listar um produto
router.get("/:id", controller.listProduct);

// Rota para editar um produto
router.patch("/:id", authMiddleware, controller.editProduct);

// Rota para deletar um produto
router.delete("/:id", authMiddleware, controller.deleteProduct);

module.exports = router; // exportando o router
