 require('dotenv').config();    // Carrega as variáveis de ambiente do arquivo .env

const express = require('express'); // Importa o módulo Express

const app = express() // Cria uma instância do Express
app.use(express.json()); // Middleware para ler JSON no corpo das requisições

// importa a rota de produtos
const productRoutes = require('./src/Stock/routes/productRoutes'); 
app.use('/store/products', productRoutes); // Usa as rotas dos produtos

// importa a rota de categorias
const categoryRoutes = require('./src/Stock/routes/categoryRoutes'); 
app.use('/store/categories', categoryRoutes); // Usa as rotas das categorias  

// importa a rota de autenticação do admin
const authRoutes = require('./src/Admin/routes/adminRoutes'); 
app.use('/auth', authRoutes); // Usa as rotas de autenticação

// importa a rota de usuarios
const userRoutes = require('./src/User/Routes/userRoutes'); 
app.use('/user', userRoutes); // Usa as rotas de usuarios 



// Rota de exemplo para testar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});