const prisma = require('../../lib/prisma'); // importando o prisma
const { z } = require('zod'); // importando o zod

//================================= esquemas de validação do zod

// esquema de validação do id
const idSchema = z.preprocess((val) => Number(val), z.number().int().positive("ID inválido"));


//========================== rotas de pedidos


// Rota para criar um novo pedido
const createOrder = async (req, res) => { // funçao assincrona
    try {
        const cart = await prisma.cart.findUnique({ // busca o carrinho com os itens
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!cart) { // se o carrinho n for encontrado
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }
        if (cart.items.length === 0) { // se o carrinho estiver vazio
            return res.status(400).json({ error: "Carrinho vazio" });
        }
        // calcula o total
        const total = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
        
        // cria o pedido
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                total,
                status: 'PENDING'
            }
        });
        // cria os itens do pedido com preço congelado
        const orderItems = cart.items.map(item => ({
            orderId: order.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
        }));
        await prisma.orderItem.createMany({ data: orderItems }); // cria os itens
        // diminui o estoque de cada produto individualmente
        await Promise.all( // usei promise.all para diminuir o estoque de todos os produtos ao mesmo tempo
            cart.items.map(item =>
                prisma.product.update({
                    where: { id: item.product.id },
                    data: { stock: { decrement: item.quantity } }
                })
            )
        );
        // esvazia o carrinho
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        res.json({ message: "Pedido criado com sucesso", order }); // envia resposta
} catch (error) { // trata o erro caso tenha
        console.log(error);
        res.status(500).json({ error: "Erro ao criar o pedido" });
    }
};


//rota para listar todos os pedidos
const listAllOrders = async (req, res) => { // funçao assincrona
    try{
        const userId = req.user.id; // variavel que recebe o id do user
        const orders = await prisma.order.findMany({ // busca todos os pedidos
          where: { userId },
          include: { // usei include para mostrar o carrinho junto com o produto
            items: {
              include: {
                product: true
              }
            }
          }
        });
        res.json(orders); // envia resposta
    } catch (error) { // trata o erro caso tenha
        console.log(error);
        res.status(500).json({ error: "Erro ao listar os pedidos" });
    }
};

// busca pedido por id
const listOrder = async (req, res) => { // funçao assincrona
    try {
    const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
    const order = await prisma.order.findUnique({ // busca o pedido
        where: { id }, // recebe o id validado
        include: { // usei include para mostrar o carrinho junto com o produto
            items: {
            include: {
            product: true
            }
        }
    }
    });
    if (!order) { // se o pedido não existir ou n for encontrado
        return res.status(404).json({ error: "Pedido n encontrado" });
    }
    if (order.userId !== req.user.id) { // se o pedido n pertencer ao user logado
        return res.status(403).json({ error: "Pedido n pertence ao user" });
    }
    res.json(order); // envia resposta
    } catch (error) { // trata o erro caso tenha
        if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error);
        res.status(500).json({ error: "Erro ao listar o pedido" });
    }  
};

module.exports = { // exportando as funcoes
    createOrder,
    listAllOrders,
    listOrder
};