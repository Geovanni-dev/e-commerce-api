const express = require('express'); // importando o express
const router = express.Router(); // criando o router
const controller = require('../controllers/categoriesController'); // importando o controller


// Rota para criar uma nova categoria
router.post('/', controller.createCategory);

//  rota para listar todas as categorias
router.get('/', controller.listAllCategories);

// Rota para listar uma categoria
router.get('/:id', controller.listCategory);

// Rota para atualizar uma categoria
router.patch('/:id', controller.editCategory);


// rota para deletar uma categoria
router.delete('/:id', controller.deleteCategory);


module.exports = router; // exportando o router