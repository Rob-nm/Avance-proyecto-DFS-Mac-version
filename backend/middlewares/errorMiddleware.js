const errorHandler = (err, req, res, next) => {
    // Para debugging interno
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        mensaje: err.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorHandler };