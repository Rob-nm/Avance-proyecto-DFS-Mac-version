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
router.post('/login', async (req, res) => {
    try {
        const { nombre, password } = req.body;
        
        const [rows] = await db.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const passwordValida = await bcrypt.compare(password, rows[0].password);
        if (!passwordValida) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: rows[0].id, nombre: rows[0].nombre, rol: rows[0].rol }, 
            process.env.JWT_SECRET || 'supersecreto', 
            { expiresIn: '2h' }
        );

        res.json({ 
            mensaje: "Bienvenido", 
            usuario: rows[0].nombre, 
            rol: rows[0].rol,
            token: token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;

