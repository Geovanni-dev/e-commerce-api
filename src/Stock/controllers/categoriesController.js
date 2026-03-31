const prisma = require('../../lib/prisma'); // importando o prisma
const { z } = require('zod'); // importando o zod

// esquema de validação do produto
const categorySchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres")
});

const idSchema = z.preprocess((val) => Number(val), z.number().int().positive("ID inválido")); // esquema de validação do id


// Rota para criar uma nova categoria (com validação do esquema do zod)
const createCategory = async (req, res) => {
    try {
        const validatedCategory = categorySchema.parse(req.body); // variavel que recebe os dados validados pelo esquema 
        const category = await prisma.category.create({
            data: validatedCategory // recebe os dados validados do zod
        });
        res.json(category)
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        if (error.code === 'P2002') { // se o erro for do prisma            
            return res.status(409).json({ error: 'Ja existe uma categoria com esse nome' });        
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: 'Erro ao criar a categoria' });
    }
};

// rota para listar todas as categorias 
const listAllCategories =  async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao listar as categorias' });
    }
}

// rota para listar uma categoria (com validação do esquema do zod)
const listCategory = async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
        const category = await prisma.category.findUnique({
            where: { id } // recebe o id validado pelo zod
        });
        if (!category) { // Para caso o cliente digite uma categoria n existente
        return res.status(404).json({ error: 'Categoria n encontrada' });
        }
        res.json(category)
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: 'Erro ao listar a categoria' });
    }
};

// Rota para atualizar uma categoria (com validação do esquema do zod)
const editCategory =  async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
        const validatedCategory = categorySchema.partial().parse(req.body); // variavel q torna os dados opcionais do esquema do zod
        const category = await prisma.category.update({
            where: { id }, // recebe o id validado do esquema do zod
            data: validatedCategory // recebe os dados validados do esquema do zod
        });
        res.json(category)
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Categoria n encontrada' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao atualizar a categoria' });
    }
};

// rota para deletar uma categoria (com validação do esquema do zod)
const deleteCategory = async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id); // variavel que recebe o id validado
        const category = await prisma.category.delete({
            where: { id }
        });
        res.json(category)
    } catch (error) {
      if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        if (error.code === 'P2025') { // se o erro for do prisma
            return res.status(404).json({ error: 'Categoria n encontrada' });
        }
        console.log(error); // se n for do zod nem do prisma
        res.status(500).json({ error: 'Erro ao deletar a categoria' });
    }
};

module.exports = {
    createCategory,
    listAllCategories,
    listCategory,
    editCategory,
    deleteCategory
};