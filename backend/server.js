const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./database');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuración de Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a BD
connectDB();

// --- MODELOS DE MONGOOSE ---
const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fecha_registro: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const ProductoSchema = new mongoose.Schema({
    nombre: String,
    categoria: String,
    precio_50: Number,
    precio_100: Number,
    stock_50: { type: Number, default: 15 },
    stock_100: { type: Number, default: 15 },
    imagen_url: String
});
const Producto = mongoose.model('Producto', ProductoSchema);

const PedidoSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    productos: Array,
    total: Number,
    direccion_envio: String,
    fecha: { type: Date, default: Date.now }
});
const Pedido = mongoose.model('Pedido', PedidoSchema);

// --- RUTAS DE BASE DE DATOS ---
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json({ resultados: productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pedidos', async (req, res) => {
    const { usuario_id, productos, total, direccion_envio } = req.body; 
    try {
        const nuevoPedido = new Pedido({ usuario_id, productos, total, direccion_envio });
        await nuevoPedido.save();
        res.json({ mensaje: 'Pedido creado', pedido: nuevoPedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        await Pedido.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Pedido eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/pedidos/:id', async (req, res) => {
    try {
        const { direccion_envio } = req.body;
        await Pedido.findByIdAndUpdate(req.params.id, { direccion_envio });
        res.json({ mensaje: 'Dirección actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ error: 'El usuario ya existe' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        usuario = new Usuario({ nombre, email, password: hashedPassword });
        await usuario.save();

        const token = jwt.sign({ id: usuario._id }, 'clave_secreta_tomford', { expiresIn: '30d' });
        res.json({ token, usuario: usuario.nombre });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { nombre, password } = req.body;
    try {
        let usuario = await Usuario.findOne({ nombre });
        if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: usuario._id }, 'clave_secreta_tomford', { expiresIn: '30d' });
        res.json({ token, usuario: usuario.nombre });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE APIs EXTERNAS ---

// 1. API de Tipo de Cambio (MXN a USD)
app.get('/api/conversion/:moneda', async (req, res) => {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${req.params.moneda}`);
        const data = await response.json();
        res.json({ tasasDeCambio: data.rates });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tasas de cambio' });
    }
});

// 2. API de Zippopotam.us (Códigos Postales de México)
app.get('/api/envio/:cp', async (req, res) => {
    try {
        const response = await fetch(`http://api.zippopotam.us/mx/${req.params.cp}`);
        if (!response.ok) throw new Error('CP no encontrado');
        const data = await response.json();
        res.json({ ciudad: data.places[0]['place name'], estado: data.places[0]['state'] });
    } catch (error) {
        res.status(404).json({ error: 'Código postal no válido' });
    }
});

// 3. API de Stripe (Procesamiento de Pagos)
app.post('/api/crear-pago', async (req, res) => {
    try {
        const { carrito } = req.body;
        
        const lineItems = carrito.map((item) => ({
            price_data: {
                currency: 'mxn',
                product_data: {
                    name: item.nombre,
                },
                unit_amount: item.precio * 100, // Stripe procesa en centavos
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:5173/?pago=exito',
            cancel_url: 'http://localhost:5173/',
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
