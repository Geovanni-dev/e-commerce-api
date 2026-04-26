require('dotenv').config();    // Carrega as variáveis de ambiente do arquivo .env

const express = require('express'); // Importa o módulo Express

//importao do rateLimit
const { globalLimiter } = require('./src/middlewares/rateLimit');

const app = express() // Cria uma instância do Express
app.use(express.json()); // Middleware para ler JSON no corpo das requisições


app.use(globalLimiter); // Usa o middleware globalLimiter

// importa a rota de produtos
const productRoutes = require('./src/Stock/routes/productRoutes'); 
app.use('/store/products', productRoutes); // Usa as rotas dos produtos

// importa a rota de categorias
const categoryRoutes = require('./src/Stock/routes/categoryRoutes'); 
app.use('/store/categories', categoryRoutes); // Usa as rotas das categorias  

// importa a rota de usuarios
const userRoutes = require('./src/User/routes/userRoutes'); 
app.use('/user', userRoutes); // Usa as rotas de usuarios 

// importa a rota de carrinho
const cartRoutes = require('./src/Cart/routes/cartRoutes'); 
app.use('/store/cart', cartRoutes); // Usa as rotas do carrinho


// Rota de exemplo para testar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});