const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./database');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

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
    
    rol: { type: String, default: 'usuario' }, 
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

app.use(session({ secret: process.env.SESSION_SECRET || 'secreto', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const procesarOAuth = async (accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails?.[0]?.value || `${profile.id}@oauth.com`;
        let usuario = await Usuario.findOne({ email });
        
        if (!usuario) {
            usuario = new Usuario({
                nombre: profile.displayName || profile.username || 'Usuario OAuth',
                email: email,
                password: 'oauth_dummy_password' 
            });
            await usuario.save();
        }
        const token = jwt.sign({ id: usuario._id }, 'clave_secreta_tomford', { expiresIn: '30d' });
        return done(null, { token, nombre: usuario.nombre });
    } catch (error) {
        return done(error, null);
    }
};

passport.use(new GoogleStrategy({ clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackURL: "/api/auth/google/callback" }, procesarOAuth));
passport.use(new GitHubStrategy({ clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, callbackURL: "/api/auth/github/callback" }, procesarOAuth));
passport.use(new FacebookStrategy({ 
    clientID: process.env.FACEBOOK_APP_ID, 
    clientSecret: process.env.FACEBOOK_APP_SECRET, 
    callbackURL: "http://localhost:4000/api/auth/facebook/callback", 
    profileFields: ['id', 'displayName', 'name', 'emails'] 
}, procesarOAuth));

const authExito = (req, res) => {
    res.redirect(`http://localhost:5173/?token=${req.user.token}&user=${req.user.nombre}`);
};

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), authExito);

app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), authExito);

app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), authExito);


// --- RUTAS DE BASE DE DATOS ---

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json({ resultados: productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear nuevo producto (ADMIN)
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.json({ mensaje: 'Producto creado', producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar producto (ADMIN y Actualización de Stock)
app.put('/api/productos/:id', async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ mensaje: 'Producto actualizado', producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto (ADMIN)
app.delete('/api/productos/:id', async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pedidos', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No autorizado' });
        
        const decoded = jwt.verify(token, 'clave_secreta_tomford');
        const { productos, total, direccion_envio } = req.body; 
        
        const nuevoPedido = new Pedido({ usuario_id: decoded.id, productos, total, direccion_envio });
        await nuevoPedido.save();
        res.json({ mensaje: 'Pedido creado', pedido: nuevoPedido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No autorizado' });
        
        const decoded = jwt.verify(token, 'clave_secreta_tomford');
        const pedidos = await Pedido.find({ usuario_id: decoded.id });
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

        // 1. Usamos la variable de entorno para el secreto (más seguro)
        // 2. Metemos el rol dentro del token para que el middleware lo vea después
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol }, 
            process.env.JWT_SECRET || 'clave_temporal', 
            { expiresIn: '30d' }
        );

        // 3. ¡ESTA ES LA LÍNEA CLAVE! Debes enviar el rol en el JSON
        res.json({ 
            token, 
            usuario: usuario.nombre, 
            rol: usuario.rol // <-- Sin esto, Jest siempre recibirá 'undefined'
        });

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
module.exports = app
const PORT = process.env.PORT || 4000;

// CAMBIO AQUÍ: Solo se prende si NO estamos en modo de prueba (test)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
}