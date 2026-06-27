<div align="right">
  <a href="./README.md">🇺🇸 English</a>
</div>

<h1 align="center">🛒 E-commerce API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black"/>
</p>

---

## 📋 Sobre

API RESTful completa para um e-commerce. Cobre todo o fluxo de compras: autenticação, gestão de produtos e categorias, carrinho de compras e finalização de pedidos. Conta com validação de dados via Zod, autenticação com JWT, envio de e-mails via Nodemailer e ORM Prisma integrado ao PostgreSQL. Toda a infraestrutura está containerizada com Docker, incluindo painel administrativo pgAdmin. A qualidade do código é garantida por ESLint, Prettier e EditorConfig.

---

## 🖥️ Sobre o Projeto

![Banner](./public/imagens/banner-e-commerce.png)

---

## 🗄️ Diagrama do Banco de Dados

![Diagrama](./public/imagens/diagrama.png)

---

## 🛠 Tecnologias

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Runtime** | `Node.js + Express` | Servidor e roteamento |
| **Banco de Dados** | `PostgreSQL + Prisma` | Persistência relacional e ORM |
| **Admin do Banco** | `pgAdmin` | Painel de administração visual para o PostgreSQL |
| **Autenticação** | `JWT + Bcrypt.js` | Auth por token e hash de senhas |
| **Validação** | `Zod` | Validação de schemas e dados |
| **E-mail** | `Nodemailer` | E-mails de verificação e recuperação de senha |
| **Segurança** | `Express Rate Limit` | Proteção contra spam e força bruta |
| **Infra** | `Docker + Docker Compose` | Orquestração do ambiente containerizado |
| **Qualidade de código** | `ESLint + Prettier + EditorConfig` | Formatação consistente em toda a base de código |

---

## 🗂️ Estrutura do Projeto

```text
E-commerce/
├── prisma/
│   ├── migrations/               # Histórico de migrations do Prisma
│   ├── schema.prisma             # Definição do schema do banco de dados
│   └── seed.js                   # Script de dados iniciais
├── src/
│   ├── Cart/
│   │   ├── controllers/
│   │   │   └── cartController.js     # Lógica de CRUD do carrinho
│   │   └── routes/
│   │       └── cartRoutes.js         # Definição das rotas do carrinho
│   ├── Order/
│   │   ├── controller/
│   │   │   └── orderController.js    # Lógica de finalização de pedidos
│   │   └── routes/
│   │       └── orderRoutes.js        # Definição das rotas de pedidos
│   ├── Stock/
│   │   ├── controllers/
│   │   │   ├── categoriesController.js  # Lógica de CRUD de categorias
│   │   │   └── productController.js     # Lógica de CRUD de produtos
│   │   └── routes/
│   │       ├── categoryRoutes.js     # Definição das rotas de categorias
│   │       └── productRoutes.js      # Definição das rotas de produtos
│   ├── User/
│   │   ├── controllers/
│   │   │   └── userController.js     # Lógica de auth e gestão de usuários
│   │   └── routes/
│   │       └── userRoutes.js         # Definição das rotas de usuários
│   ├── lib/
│   │   └── prisma.js                 # Singleton do cliente Prisma
│   ├── middlewares/
│   │   ├── authMiddleware.js         # Middleware de verificação JWT
│   │   └── rateLimit.js              # Regras de rate limiting
│   └── services/
│       └── emailService.js           # Lógica de envio de e-mails via Nodemailer
├── .editorconfig                     # Regras de formatação para editores (indent, charset, EOL)
├── .env.example                      # Template de referência das variáveis de ambiente
├── .eslintrc.json                    # Regras e configuração do parser ESLint
├── .prettierrc                       # Preferências de formatação do Prettier
├── docker-compose.yml                # Orquestração de múltiplos containers
├── Dockerfile                        # Instruções de build da imagem de produção
├── server.js                         # Ponto de entrada da aplicação
└── package.json
```

---

## 📡 Endpoints da API

> 🔒 Rotas com este ícone exigem o header: `Authorization: Bearer <token_jwt>`
> 👑 Rotas com este ícone exigem a role de **ADMIN**.

### Autenticação e Usuários — `/user`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/register` | POST | ❌ | `{"name","email","password"}` | Cria conta e carrinho |
| `/verify-code` | POST | ❌ | `{"email","code"}` | Valida o e-mail com código |
| `/login` | POST | ❌ | `{"email","password"}` | Retorna o Token JWT |
| `/reset-password` | POST | ❌ | `{"email"}` | Envia link de recuperação de senha |
| `/reset-password/:token` | POST | ❌ | `{"password"}` | Define nova senha via token |
| `/users` | GET | 👑 | — | Lista todos os usuários |
| `/users/:id` | GET | 👑 | — | Busca usuário por ID |
| `/users/:id` | DELETE | 👑 | — | Deleta usuário por ID |

### Produtos — `/store/products`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | POST | 👑 | `{"name","description","price","stock","categoryId"}` | Cria um produto |
| `/` | GET | ❌ | — | Lista todos os produtos |
| `/:id` | GET | ❌ | — | Busca produto por ID |
| `/:id` | PATCH | 👑 | `{"price"}` | Edita um produto |
| `/:id` | DELETE | 👑 | — | Deleta um produto |

### Categorias — `/store/categories`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | POST | 👑 | `{"name"}` | Cria uma categoria |
| `/` | GET | ❌ | — | Lista todas as categorias |
| `/:id` | GET | ❌ | — | Busca categoria por ID |
| `/:id` | PATCH | 👑 | `{"name"}` | Edita uma categoria |
| `/:id` | DELETE | 👑 | — | Deleta uma categoria |

### Carrinho — `/store/cart`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | GET | 🔒 | — | Visualiza o carrinho com itens e produtos |
| `/item` | POST | 🔒 | `{"productId","quantity"}` | Adiciona item ao carrinho |
| `/item/:id` | PATCH | 🔒 | `{"quantity"}` | Edita quantidade de um item |
| `/item/:id` | DELETE | 🔒 | — | Remove item do carrinho |

> 💡 O carrinho é criado automaticamente ao registrar uma conta.

### Pedidos — `/store/orders`

| Rota | Método | Auth | Payload | Descrição |
|---|---|---|---|---|
| `/` | POST | 🔒 | — | Finaliza a compra com todos os itens do carrinho |
| `/` | GET | 🔒 | — | Lista todos os pedidos do usuário |
| `/:id` | GET | 🔒 | — | Busca pedido por ID |

> 💡 Ao finalizar a compra: o preço é congelado no momento da compra, o estoque é decrementado e o carrinho é esvaziado automaticamente.

---

## 🚀 Instalação e Execução (Docker)

Certifique-se de ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/e-commerce-api.git
cd e-commerce-api

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Preencha os valores no .env

# 3. Suba a infraestrutura (API, Banco e pgAdmin)
docker-compose up -d --build

# 4. Gere as tabelas no banco de dados
docker-compose exec api npx prisma migrate dev
```

### Acessos locais

| Serviço | URL |
|---|---|
| API | `http://localhost:3000` |
| pgAdmin | `http://localhost:8080` (credenciais do `.env`) |

---

## 📄 Licença

**MIT © Geovani Rodrigues**
