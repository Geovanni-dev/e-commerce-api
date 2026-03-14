const express = require('express'); // importando o express
const router = express.Router(); // criando o router
const prisma = require('../lib/prisma'); // importando o prisma




// Rota para criar um novo produto
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock, categoryId } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                stock: parseInt(stock),
                categoryId: parseInt(categoryId)
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar o produto' });
    }
});



// Rota para listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { 
                category: true }}); // Funçao para mostrar as categorias
        res.json(products)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar os produtos' });
    }
});


// Rota para atualizar um produto
router.patch('/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const product = await prisma.product.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                description,
                price: Number(price),
                stock: parseInt(stock)
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'Erro ao atualizar o produto' });
    }
});


// Rota para deletar um produto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.delete({
            where: {
                id: parseInt(id)
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'Erro ao deletar o produto' });
    }
})


module.exports = router // exportando o router