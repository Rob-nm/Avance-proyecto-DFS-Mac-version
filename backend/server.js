require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51T591X08bbcE0BmPVDc7zGb5BQ9HNEQ7JkHq9JEhvbDqqWss06sY2YLaxR2AzZTAapQbX57M9zmXOGyUbLoVNqPW00nci4iKVu');

const db = require('./db'); 
const authRoutes = require('./routes/auth');
const { verificarToken, esAdmin } = require('./middlewares/authMiddleware');
const { validarProducto } = require('./middlewares/validacionMiddleware');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// --- RUTAS DE AUTENTICACIÓN ---
app.use('/api/auth', authRoutes);

// --- RUTAS DE PRODUCTOS ---
app.get('/api/productos', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || 999999;

        let sql = 'SELECT * FROM productos WHERE precio_50 >= ? AND precio_50 <= ?';
        const params = [minPrice, maxPrice];

        if (search) {
            sql += ' AND nombre LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        const [totalRows] = await db.query('SELECT COUNT(*) as count FROM productos');
        
        res.json({
            info: {
                totalProductos: totalRows[0].count,
                paginaActual: page,
                totalPaginas: Math.ceil(totalRows[0].count / limit)
            },
            resultados: rows
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/productos', verificarToken, esAdmin, validarProducto, async (req, res, next) => {
    try {
        const { nombre, precio_50, precio_100, stock_50, stock_100, imagen_url } = req.body;
        const sql = 'INSERT INTO productos (nombre, precio_50, precio_100, stock_50, stock_100, imagen_url) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(sql, [nombre, precio_50, precio_100, stock_50 || 0, stock_100 || 0, imagen_url || '']);
        res.status(201).json({ mensaje: 'Producto creado exitosamente' });
    } catch (error) {
        next(error);
    }
});

// --- API EXTERNA 1: PAGOS (STRIPE) ---
app.post('/api/crear-pago', verificarToken, async (req, res, next) => {
    try {
        const { carrito } = req.body; 
        const lineItems = carrito.map(item => ({
            price_data: {
                currency: 'mxn',
                product_data: { name: item.nombre },
                unit_amount: item.precio * 100,
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:5173/?pago=exito',
            cancel_url: 'http://localhost:5173/?pago=cancelado',
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        next(new Error('Error en la API de Stripe: ' + error.message));
    }
});

// --- API EXTERNA 2: CONVERSIÓN DE MONEDA ---
app.get('/api/conversion/:monedaBase', async (req, res, next) => {
    try {
        const { monedaBase } = req.params;
        const respuestaAPI = await axios.get(`https://open.er-api.com/v6/latest/${monedaBase.toUpperCase()}`);
        res.status(200).json({
            monedaBase: respuestaAPI.data.base_code,
            tasasDeCambio: { USD: respuestaAPI.data.rates.USD, EUR: respuestaAPI.data.rates.EUR }
        });
    } catch (error) {
        res.status(502).json({ error: 'Error al consumir la API de Monedas' });
    }
});

// --- API EXTERNA 3: CÓDIGOS POSTALES ---
app.get('/api/envio/:cp', async (req, res, next) => {
    try {
        const { cp } = req.params;
        const respuestaAPI = await axios.get(`https://api.zippopotam.us/mx/${cp}`);
        const datosLugar = respuestaAPI.data.places[0];
        res.status(200).json({
            estado: datosLugar.state,
            ciudad: datosLugar['place name'],
            pais: respuestaAPI.data.country
        });
    } catch (error) {
        res.status(404).json({ error: 'C.P. no encontrado' });
    }
});

// --- CRUD DE PEDIDOS (HISTORIAL Y GESTIÓN) ---

// OBTENER PEDIDOS (READ)
app.get('/api/pedidos', verificarToken, async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC', 
            [req.usuario.id]
        );
        const pedidosFormateados = rows.map(p => ({
            ...p,
            productos: JSON.parse(p.productos)
        }));
        res.json(pedidosFormateados);
    } catch (error) {
        next(error);
    }
});

// CREAR PEDIDO (POST)
app.post('/api/pedidos', verificarToken, async (req, res, next) => {
    try {
        const { productos, total, direccion_envio } = req.body; // Recibimos la dirección
        const sql = 'INSERT INTO pedidos (usuario_id, productos, total, direccion_envio) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [req.usuario.id, JSON.stringify(productos), total, direccion_envio]);
        res.status(201).json({ mensaje: 'Pedido guardado', pedidoId: result.insertId });
    } catch (error) { next(error); }
});

// ACTUALIZAR PEDIDO (PUT)
app.put('/api/pedidos/:id', verificarToken, async (req, res, next) => {
    try {
        const { productos, total, direccion_envio } = req.body; // Permitimos editar la dirección
        const sql = 'UPDATE pedidos SET productos = ?, total = ?, direccion_envio = ? WHERE id = ? AND usuario_id = ?';
        const [result] = await db.query(sql, [JSON.stringify(productos), total, direccion_envio, req.params.id, req.usuario.id]);
        res.json({ mensaje: 'Pedido actualizado' });
    } catch (error) { next(error); }
});

// ELIMINAR PEDIDO (DELETE)
app.delete('/api/pedidos/:id', verificarToken, async (req, res, next) => {
    try {
        const [result] = await db.query('DELETE FROM pedidos WHERE id = ? AND usuario_id = ?', [req.params.id, req.usuario.id]);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: "No encontrado" });
        res.json({ mensaje: 'Pedido eliminado' });
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});