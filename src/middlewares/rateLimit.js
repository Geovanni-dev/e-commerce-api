const rateLimit = require("express-rate-limit"); // importa o express-rate-limit

const blockedIps = {};

const globalLimiter = rateLimit({
        windowMs: 60 * 1000, //1 minuto
        max: 100, // limite de 100 requisicoes por minuto
        handler: (req, res) => {
        const ip = req.ip;
        const now = Date.now();
        
        if (blockedIps[ip]  && now < blockedIps[ip]) {
            const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
            return res.status(429).json({ 
                error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
            });
        }
        
        blockedIps[ip] = now +(5 * 60 * 1000); // bloqueia por 5 minutos
        
            return res.status(429).json({ // envia resposta
                error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
            });
        }
    });

    const limiter = rateLimit({
        windowMs: 60 * 1000, //1 minuto
        max: 5, // limite de 5 requisicoes por minuto
        handler: (req, res) => { // funcao para lidar com o limite de requisicoes
            const ip = req.ip;
            const now = Date.now();
            
            if (blockedIps[ip]  && now < blockedIps[ip]) { // se o ip nao estiver bloqueado
                const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
                return res.status(429).json({ 
                    error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
                });
            }
            
            blockedIps[ip] = now +(5 * 60 * 1000); // bloqueia por 5 minutos
            
                return res.status(429).json({ // envia resposta
                error: "Muitas tentativas frequeêntes, tente novamente mais tarde"
            });
        }
    });

    module.exports = { globalLimiter, limiter };