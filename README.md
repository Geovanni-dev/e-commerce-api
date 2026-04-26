<h1 align="center">🛒 E-commerce API</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Zod-3E6B9E?style=for-the-badge&logo=zod&logoColor=white"/>
</p>

## 📋 Sobre

API REST completa para um e-commerce, com fluxo de autenticação, gestão de produtos e categorias, carrinho de compras e finalização de pedidos. O projeto conta com validação de dados utilizando **Zod**, autenticação via **JWT**, envio de e-mails com **Nodemailer** e ORM **Prisma** com banco de dados **PostgreSQL**.

---

## 🚀 Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/e-commerce-api.git

# 2. Instale as dependências
npm install

# 3. Configure o arquivo .env
# Crie um arquivo .env na raiz com as seguintes chaves:
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecommerce_db"
JWT_SECRET=sua_chave_secreta
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha_de_app

# 4. Rode as migrations do banco
npx prisma migrate dev

# 5. Inicie o servidor
npm start
```

> ⚠️ *Rotas protegidas exigem o Header:*
> `Authorization: Bearer <seu_token_jwt>`

> ⚠️ *Rotas marcadas com 🔒 exigem autenticação. Rotas marcadas com 👑 exigem role de ADMIN.*

---

## 📡 Guia de Endpoints & Payloads

### 🔐 Autenticação e Usuários (`/user`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/register` | POST | ❌ | `{"name": "Geo", "email": "a@a.com", "password": "123"}` | Cria nova conta e carrinho |
| `/verify-code` | POST | ❌ | `{"email": "a@a.com", "code": "ABC123"}` | Valida o e-mail com código |
| `/login` | POST | ❌ | `{"email": "a@a.com", "password": "123"}` | Retorna o Token JWT |
| `/reset-password` | POST | ❌ | `{"email": "a@a.com"}` | Envia link de recuperação de senha |
| `/reset-password/:token` | POST | ❌ | `{"password": "nova_senha"}` | Define nova senha via token |
| `/users` | GET | 👑 | Nenhum | Lista todos os usuários |
| `/users/:id` | GET | 👑 | Nenhum | Busca usuário por ID |
| `/users/:id` | DELETE | 👑 | Nenhum | Deleta usuário por ID |

---

### 📦 Produtos (`/store/products`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | POST | 👑 | `{"name": "iPhone 16", "description": "512GB", "price": 9999.99, "stock": 50, "categoryId": 1}` | Cria novo produto |
| `/` | GET | ❌ | Nenhum | Lista todos os produtos |
| `/:id` | GET | ❌ | Nenhum | Busca produto por ID |
| `/:id` | PATCH | 👑 | `{"price": 8999.99}` | Edita produto |
| `/:id` | DELETE | 👑 | Nenhum | Deleta produto |

---

### 🗂️ Categorias (`/store/categories`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | POST | 👑 | `{"name": "iPhones"}` | Cria nova categoria |
| `/` | GET | ❌ | Nenhum | Lista todas as categorias |
| `/:id` | GET | ❌ | Nenhum | Busca categoria por ID |
| `/:id` | PATCH | 👑 | `{"name": "Novo Nome"}` | Edita categoria |
| `/:id` | DELETE | 👑 | Nenhum | Deleta categoria |

---

### 🛒 Carrinho (`/store/cart`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | GET | 🔒 | Nenhum | Visualiza o carrinho com itens e produtos |
| `/item` | POST | 🔒 | `{"productId": 1, "quantity": 2}` | Adiciona item ao carrinho |
| `/item/:id` | PATCH | 🔒 | `{"quantity": 3}` | Edita quantidade de um item |
| `/item/:id` | DELETE | 🔒 | Nenhum | Remove item do carrinho |

> 💡 O carrinho é criado automaticamente ao registrar uma conta.

---

### 🧾 Pedidos (`/store/orders`)

| Rota | Método | Auth | Payload (Body) | Descrição |
|------|--------|------|----------------|-----------|
| `/` | POST | 🔒 | Nenhum | Finaliza a compra com todos os itens do carrinho |
| `/` | GET | 🔒 | Nenhum | Lista todos os pedidos do usuário |
| `/:id` | GET | 🔒 | Nenhum | Busca pedido por ID |

> 💡 Ao finalizar a compra: o preço é congelado, o estoque é decrementado e o carrinho é esvaziado automaticamente.

---

## 🗂️ Arquitetura do Projeto

```
E-commerce/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── Cart/
│   │   ├── controllers/
│   │   │   └── cartController.js
│   │   └── routes/
│   │       └── cartRoutes.js
│   ├── Order/
│   │   ├── controller/
│   │   │   └── orderController.js
│   │   └── routes/
│   │       └── orderRoutes.js
│   ├── Stock/
│   │   ├── controllers/
│   │   │   ├── categoriesController.js
│   │   │   └── productController.js
│   │   └── routes/
│   │       ├── categoryRoutes.js
│   │       └── productRoutes.js
│   ├── User/
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   └── routes/
│   │       └── userRoutes.js
│   ├── lib/
│   │   └── prisma.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── rateLimit.js
│   └── services/
│       └── emailService.js
├── .env
├── server.js
└── package.json
```

---

## 🛠 Tecnologias

- **Node.js & Express** — Ambiente de execução e framework web
- **PostgreSQL & Prisma** — Banco de dados relacional e ORM
- **Bcrypt.js** — Hash de senhas para segurança
- **JSON Web Token (JWT)** — Autenticação baseada em tokens
- **Nodemailer** — Disparo de e-mails para verificação e recuperação de senha
- **Zod** — Validação de schemas e tipagem dos dados recebidos pela API
- **Express Rate Limit** — Proteção contra spam e ataques de força bruta

---

## 📄 Licença

**MIT © Geovani Rodrigues**
