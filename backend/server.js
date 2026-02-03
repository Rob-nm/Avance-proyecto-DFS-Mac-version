const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
    console.log(` Recibí una petición: ${req.method} ${req.url}`);
    next();
});
// --- RUTAS ---

app.use('/api/auth', authRoutes);

// 1. Ruta para obtener productos
app.get('/api/productos', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// NUEVA RUTA: Procesar compra y restar stock

app.post('/api/compra', async (req, res, next) => {
    try {
        const carrito = req.body; 

        // Usamos un bucle para procesar cada item de forma asíncrona
        for (const item of carrito) {
            const columnaStock = item.selectedSize === '50ml' ? 'stock_50' : 'stock_100';
            
            // Query segura usando await para restar el stock
            const sql = `UPDATE productos SET ${columnaStock} = ${columnaStock} - ? WHERE id = ?`;
            
            await db.query(sql, [item.quantity, item.id]);
        }

        res.json({ mensaje: "Compra procesada y stock actualizado correctamente" });

    } catch (error) {
       
        next(error);
    }
});

// --- MANEJO DE ERRORES ---

app.use((err, req, res, next) => {
    console.error(`[Error]: ${err.stack}`);
    res.status(500).json({
        estado: 'error',
        mensaje: 'Ocurrió un error interno en el servidor.',
        detalle: process.env.NODE_ENV === 'development' ? err.message : null
    });
});

// --- SERVIDOR ---
const PORT = 4000; 
app.listen(PORT, () => console.log(`Base de datos corrriendo en el puerto ${PORT}`));