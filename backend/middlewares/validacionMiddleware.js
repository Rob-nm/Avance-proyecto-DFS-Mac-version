const validarProducto = (req, res, next) => {
    const { nombre, precio_50, precio_100 } = req.body;

    if (!nombre || typeof nombre !== 'string') {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe ser texto.' });
    }
    if (!precio_50 || isNaN(precio_50) || !precio_100 || isNaN(precio_100)) {
        return res.status(400).json({ error: 'Los precios son obligatorios y deben ser números válidos.' });
    }

    next(); 
};

module.exports = { validarProducto };