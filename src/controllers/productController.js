const prisma = require('../lib/prisma'); // importando o prisma


// Rota para criar um novo produt
const createProduct = async (req, res) => { 
    try {
        const { name, description, price, stock, categoryId } = req.body;
        if (!categoryId) {
                return res.status(400).json({ error: 'Digite uma categoria' });
            }
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
};

// Rota para listar todos os produtos
const listAllProducts = async (req, res) => {
    try {
        const { minPrice, maxPrice, name, order, limit, page } = req.query;
        
        const itemsLimit = limit ? parseInt(limit) : 50; // limita a quantidade de produtos exibidos
        const currentPage = page ? parseInt(page) : 1; // pular a quantidade de produtos exibidos
        
        const products = await prisma.product.findMany({
        include: { // para mostrar as categorias no produto
            category: true 
        }, 
            
        where: { // para filtrar os produtos por preco e nome
            name: name ? { 
                contains: name, // contains serve pra buscas parciais
                mode : 'insensitive' // serve para n diferenciar maiusculas e minusculas
        } : undefined,
        
            price: { // definir um valor maximo || minimo 
                lte: maxPrice ? Number(maxPrice) : undefined,
                gte: minPrice ? Number(minPrice) : undefined }
        }, 
        
        orderBy: // ordenaçao de produtos ex; asc (0-9), desc (9-0), name (a-z), name (z-a)
            order === 'preco_asc' ? { price: 'asc' } :  // do menor preço para o maior
            order === 'preco_desc' ? { price: 'desc' } : // do maior preco para o menor
            order === 'nome_asc' ? { name: 'asc' } : // de a-z
            order === 'nome_desc' ? { name: 'desc' } /* de z-a*/ : undefined,
        
        take: itemsLimit , // limita a quantidade de produtos exibidos na pagina de busca
        skip: (currentPage - 1) * itemsLimit // pular a quantidade de produtos exibidos na pagina de busca   
        });
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
