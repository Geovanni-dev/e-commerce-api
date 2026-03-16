const prisma = require('../lib/prisma'); // importando o prisma


// Rota para criar um novo produt
const createProduct = async (req, res) => { 
    try {
        const { name, description, price, stock, categoryId } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                stock: parseInt(stock),
                categoryId: categoryId ? parseInt(categoryId): null  /* Para caso o cliente digite uma 
                categoria n existente ou n digite nada na categoria */
            } 
        })
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar o produto' });
    }
};

// Rota para listar todos os produtos
const listAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { 
                category: true }}) // Funçao para mostrar as categorias
        res.json(products)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar os produtos' });
    }
};

// rota para listar um produto
const listProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id: parseInt(id)
            },
            include: { 
                category: true }}); // Funçao para mostrar as categorias
            if (!product) { // Para caso o cliente digite um produto n existente
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar o produto' });
    }
};

// Rota para atualizar/editar um produto
const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId } = req.body;
        const product = await prisma.product.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,  
                description,
                price: price ? Number(price): undefined, // caso n digite nada aqui ele mantem igual
                stock: stock ? parseInt(stock): undefined, // caso n digite nada aqui ele mantem igual
                categoryId: categoryId ? parseInt(categoryId): undefined // caso n digite nada aqui ele mantem igual
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'Erro ao atualizar o produto' });
    }
};

// deletar produto
const deleteProduct =  async (req, res) => {
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
};

module.exports = {
    createProduct,
    listAllProducts,
    listProduct,
    editProduct,
    deleteProduct
}
