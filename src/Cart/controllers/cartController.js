const prisma = require('../../lib/prisma'); // importando o prisma
const { z } = require('zod'); // importando o zod

//================================= esquemas de validação do zod

// esquema de validação do id
const idSchema = z.preprocess((val) => Number(val), z.number().int().positive("ID inválido"));

// schema para adicionar item ao carrinho
const cartItemSchema = z.object({
    productId : z.preprocess((val) => Number(val), z.number().int().positive("ID inválido")),
    quantity: z.number().int().positive("quantity inválida")
});

// schema para editar item do carrinho
const editItemSchema = z.object({
    quantity: z.number().int().positive("Quantidade inválida")
});


//================================= funçoes do carrinho

// add item ao carrinho
const addItemCart = async (req, res) => {
    try {
    const { productId, quantity} = cartItemSchema.parse(req.body); // variavel que recebe os dados ja valizados do zod
    const cart = await prisma.cart.findUnique({ // buscando o carrinho
        where: { // buscando o carrinho associado ao usuario logado
            userId: req.user.id 
        }
    });
    if (!cart) { // se o carrinho n for encontrado
        return res.status(404).json({ error: "Carrinho não encontrado" });
    }
    const product = await prisma.product.findUnique({ // buscando o produto
        where: { // buscando o produto pelo id
            id: productId
        }
    });
     if (!product) { // se o produto n for encontrado
        return res.status(404).json({ error: "Produto não existe" });
    }
    const item = await prisma.cartItem.create({ // add o item no carrinho
        data: { // recebe os dados pra mandar pro banco
            cartId: cart.id,
            productId,
            quantity
        }
    }); 
    res.json(item); // envia resposta 
} catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    console.log(error); // se n for do zod
    res.status(500).json({ error: "Erro ao adicionar o item ao carrinho" });
}
};

// funçao para ver carrinho
const listCart = async (req, res) => {
    try{
    const cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id
        },
        include: { items: {
        include: { product: true }
            }
        }
        });
        if (!cart) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }
        res.json(cart);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Erro ao listar o carrinho" });   
    }
};

// função para editar carrinho (remover item ou editar quantidade)
const editItemCart = async (req, res) => {
    try {
    const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
    const { quantity } = editItemSchema.parse(req.body); // variavel que recebe os dados ja valizados do zod
    const cartItem = await prisma.cartItem.findUnique({ // buscando o produto e verificando se pertense ao arrinho do user
        where: {
            id
        }, 
        include: { // usei include para mostrar o carrinho junto com o produto
            cart: true
        }
    });
    if (!cartItem) { //verifica se o produto existe
        return res.status(404).json({ error: "Produto não encontrado" });
    }
    if (cartItem.cart.userId !== req.user.id) { //verifica se o produto pertence ao carrinho do user
        return res.status(403).json({ error: "Produto n pertence ao carrinho" });
    }
    const item = await prisma.cartItem.update({ // atualiza a quantidade no banco de dados
        where: {
            id
        },
        data: {
            quantity
        }
    });
    res.json(item);// envia resposta 
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao editar o item do carrinho" });
    }
};  

// rota para remover um item do carrinho
const removeItemCart = async (req, res) => {
    try {
    const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
    const cartItem = await prisma.cartItem.findUnique({ // buscando o produto e verificando se pertense ao arrinho do user
        where: {
        id
        },
        include: { // usei include para mostrar o carrinho junto com o produto
        cart: true
        }
    });
    if (!cartItem) { //verifica se o produto existe
        return res.status(404).json({ error: "Produto não encontrado" });
    }
    if (cartItem.cart.userId !== req.user.id){ //verifica se o produto pertence ao carrinho do user
        return res.status(403).json({ error: "Produto não pertence ao carrinho" });
    }
    const item = await prisma.cartItem.delete ({ // deleta o item
        where:{
            id
        }
    });
    res.json(cartItem); // envia resposta
    
    } catch (error) {
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao remover o item do carrinho" });
    }
};

module.exports = { 
    addItemCart, 
    listCart, 
    editItemCart, 
    removeItemCart 
};


