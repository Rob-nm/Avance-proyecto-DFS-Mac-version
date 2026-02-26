const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

    try {
        const tokenLimpio = token.replace('Bearer ', ''); 
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET || 'supersecreto');
        req.usuario = verificado; 
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'Token no válido o expirado.' });
    }
};


const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Zona exclusiva para administradores.' });
    }
    next(); 
};

module.exports = { verificarToken, esAdmin };