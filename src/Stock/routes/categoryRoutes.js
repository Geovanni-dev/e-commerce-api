const express = require("express"); // importando o express
const router = express.Router(); // criando o router
const controller = require("../controllers/categoriesController"); // importando o controller

// importando o middleware
const { authMiddleware } = require("../../middlewares/authMiddleware");

// Rota para criar uma nova categoria
router.post("/", authMiddleware, controller.createCategory);

//  rota para listar todas as categorias
router.get("/", controller.listAllCategories);

// Rota para listar uma categoria
router.get("/:id", controller.listCategory);

// Rota para atualizar uma categoria
router.patch("/:id", authMiddleware, controller.editCategory);

// rota para deletar uma categoria
router.delete("/:id", authMiddleware, controller.deleteCategory);

module.exports = router; // exportando o router
