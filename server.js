 require('dotenv').config();    // Carrega as variáveis de ambiente do arquivo .env

const express = require('express'); // Importa o módulo Express

const app = express() // Cria uma instância do Express
 
app.use(express.json()); // Middleware para ler JSON no corpo das requisições

const productRoutes = require('./src/routes/productRoutes'); // Importa as rotas dos produtos

app.use('/store/products', productRoutes); // Usa as rotas dos produtos

// Rota de exemplo para testar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});