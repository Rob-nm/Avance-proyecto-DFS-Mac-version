const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro
router.post('/registro', async (req, res, next) => {
    try {
        let { nombre, email, password } = req.body;
        nombre = String(nombre).trim();
        password = String(password).trim();

        console.log(`[REGISTRO] Intentando registrar: ${nombre}`);

        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
        if (existingUser.length > 0) {
            return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // DEBUG: Ver qué se va a guardar
        console.log(`[REGISTRO] Contraseña original: "${password}"`);
        console.log(`[REGISTRO] Hash generado: ${hashedPassword}`);

        await db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', 
        [nombre, email, hashedPassword]);
        
        res.status(201).json({ mensaje: 'Usuario registrado con elegancia.' });
    } catch (error) {
        console.error('[REGISTRO ERROR]', error);
        next(error);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        let { nombre, password } = req.body;
        nombre = String(nombre).trim();
        password = String(password).trim();

        console.log('------------------------------------------------');
        console.log(`[LOGIN] Intento de acceso: ${nombre}`);

        const [users] = await db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
        
        if (users.length === 0) {
            console.log('[LOGIN] Fallo: Usuario no existe en DB');
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        const user = users[0];
        console.log(`[LOGIN] Usuario encontrado ID: ${user.id}`);
        console.log(`[LOGIN] Hash en DB: ${user.password}`);
        console.log(`[LOGIN] Contraseña enviada: "${password}"`);

        const validPass = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN] ¿Coinciden?: ${validPass}`); 

        if (!validPass) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta (Verifica terminal)' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, usuario: user.nombre });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        next(error);
    }
});

module.exports = router;

