const express = require('express'); // importando o express
const router = express.Router(); // criando o router
const prisma = require('../lib/prisma'); // importando o prisma


// Rota para criar uma nova categoria
router.post('/', async (req, res) => {
    const { name } = req.body;
    try {
        const category = await prisma.category.create({
            data: {
                name
            }
        });
        res.json(category)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar a categoria' });
    }
});

//  rota para listar todas as rotas
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar as categorias' });
    }
});

// Rota para listar uma categoria
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        if (!category) { // Para caso o cliente digite uma categoria n existente
            return res.status(404).json({ error: 'Categoria nao encontrada' });
        }
        res.json(category)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar a categoria' });
    }
});

// Rota para atualizar uma categoria
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const category = await prisma.category.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name
            }
        });
        if (!category) { // Para caso o cliente digite uma categoria n existente
            return res.status(404).json({ error: 'Categoria nao encontrada' });
        }
        res.json(category)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'Erro ao atualizar a categoria' });
    }
});


// rota para deletar uma categoria
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.delete({
            where: {
                id: parseInt(id)
            }
        });
        if (!category) { // Para caso o cliente digite uma categoria n existente
            return res.status(404).json({ error: 'Categoria nao encontrada' });
        }
        res.json(category)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'Erro ao deletar a categoria' });
    }
});


module.exports = router; // exportando o router