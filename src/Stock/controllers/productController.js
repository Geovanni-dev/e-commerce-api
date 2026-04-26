const prisma = require("../../lib/prisma"); // importando o prisma
const { z } = require("zod"); // importando o zod


// ================================= esquemas de validação do zod

// esquema de validação do produto
const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().positive("O preço deve ser maior que zero"),
  ),
  stock: z.preprocess(
    (val) => parseInt(val),
    z.number().int().nonnegative("O estoque não pode ser negativo"),
  ),
  categoryId: z.preprocess((val) => parseInt(val), z.number().int()),
});

const idSchema = z.preprocess(
  (val) => Number(val),
  z.number().int().positive("ID inválido"),
); // esquema de validação do id

// esquema de validação da query
const querySchema = z.object({
  name: z.string().optional(),
  minPrice: z
    .preprocess((val) => Number(val), z.number().positive())
    .optional(),
  maxPrice: z
    .preprocess((val) => Number(val), z.number().positive())
    .optional(),
  limit: z
    .preprocess((val) => parseInt(val), z.number().int().positive())
    .default(50),
  page: z
    .preprocess((val) => parseInt(val), z.number().int().positive())
    .default(1),
  order: z
    .enum(["preco_asc", "preco_desc", "nome_asc", "nome_desc"])
    .optional(),
});

//================================= funçoes do produto


// Rota para criar um novo produto (com validação do esquema do zod)
const createProduct = async (req, res) => {
  try {
    const validatedProduct = productSchema.parse(req.body); // variavel que recebe os dados validados pelo esquema
    const product = await prisma.product.create({
      data: validatedProduct, // recebe os dados validados
    });
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    console.log(error); // se n for do zod
    res.status(500).json({ error: "Erro ao criar o produto" });
  }
};

// Rota para listar todos os produtos (com validação do esquema da query do zod)
const listAllProducts = async (req, res) => {
  try {
    const validatedProduct = querySchema.parse(req.query); // variavel que recebe os dados validados pelo esquema da query do zod
    const products = await prisma.product.findMany({
      include: {
        // para mostrar as categorias no produto
        category: true,
      },
      where: {
        // para filtrar os produtos por preco e nome
        name: validatedProduct.name
          ? {
              contains: validatedProduct.name, // contains serve pra buscas parciais
              mode: "insensitive", // serve para n diferenciar maiusculas e minusculas
            }
          : undefined,
        price: {
          // definir um valor maximo || minimo
          lte: validatedProduct.maxPrice || undefined,
          gte: validatedProduct.minPrice || undefined,
        },
      },
      // ordenaçao de produtos ex; asc (0-9), desc (9-0), name (a-z), name (z-a)
      orderBy:
        validatedProduct.order === "preco_asc"
          ? { price: "asc" } // do menor preço para o maior
          : validatedProduct.order === "preco_desc"
            ? { price: "desc" } // do maior preco para o menor
            : validatedProduct.order === "nome_asc"
              ? { name: "asc" } // de a-z
              : validatedProduct.order === "nome_desc"
                ? { name: "desc" } /* de z-a*/
                : undefined,
      take: validatedProduct.limit, // limita a quantidade de produtos exibidos na pagina de busca
      skip: (validatedProduct.page - 1) * validatedProduct.limit, // pular a quantidade de produtos exibidos na pagina de busca
    });
    res.json(products);
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    console.log(error);
    res.status(500).json({ error: "Erro ao listar os produtos" });
  }
};

// rota para listar um produto (com validação do esquema do zod)
const listProduct = async (req, res) => {
  try {
    const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
    const product = await prisma.product.findUnique({
      where: { id }, // recebe o id validado
      include: {
        category: true,
      },
    }); // Funçao para mostrar as categorias no produto

    if (!product) {
      // Para caso o cliente digite um id n existente
      return res.status(404).json({ error: "Produto n encontrado" });
    }
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    console.log(error); // se n for do zod
    res.status(500).json({ error: "Erro ao listar o produto" });
  }
};

// Rota para atualizar/editar um produto validado com o esquema do zod
const editProduct = async (req, res) => {
  try {
    const validatedProduct = productSchema.partial().parse(req.body); // variavel q torna os dados opcionais do esquema do zod
    const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
    const product = await prisma.product.update({
      where: { id }, // recebe o id validado do esquema do zod
      data: validatedProduct, // recebe os dados validados do esquema do zod
    });
    res.json(product);
  } catch (error) {
   if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    if (error.code === "P2025") {
      // se o erro for do prisma
      return res.status(404).json({ error: "Produto n encontrado" });
    }
    console.log(error); // se n for do zod
    res.status(500).json({ error: "Erro ao atualizar o produto" });
  }
};

// Rota para deletar um produto validado com o esquema do zod
const deleteProduct = async (req, res) => {
  try {
    const id = idSchema.parse(req.params.id);
    const product = await prisma.product.delete({
      where: { id }, // recebe o id validado do esquema do zod
    });
    res.json({ message: "Produto deletado com sucesso", product });
  } catch (error) {
   if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
    if (error.code === "P2025") {
      // se o erro for do prisma
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    console.log(error); /// se n for do zod
    res.status(500).json({ error: "Erro ao deletar o produto" });
  }
};

module.exports = { // exportando as funcoes
  createProduct,
  listAllProducts,
  listProduct,
  editProduct,
  deleteProduct,
};
