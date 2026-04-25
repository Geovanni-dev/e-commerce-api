const rateLimit = require("express-rate-limit"); // importa o express-rate-limit

const globalLimiter = rateLimit({
        windowMs: 60 * 1000, //1 minuto
        max: 100, // limite de 100 requisicoes por minuto
        handler: (req, res) => {
            res.status(429).json({ 
                error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
    });
        }
    });


    const limiter = rateLimit({
        windowMs: 60 * 1000, //1 minuto
        max: 5, // limite de 5 requisicoes por minuto
        handler: (req, res) => {
            res.status(429).json({ 
                error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
    });
        }
    });

   module.exports = { globalLimiter, limiter };