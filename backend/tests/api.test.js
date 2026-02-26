const request = require('supertest');
const express = require('express');

// Simulamos tu app de express para la prueba
const app = express();
app.get('/api/productos', (req, res) => {
    res.status(200).json({ resultados: [{ nombre: 'Oudh Wood', precio_50: 3850 }] });
});

describe('Pruebas de la API de Productos', () => {
    it('GET /api/productos debe responder con status 200 y devolver un JSON', async () => {
        const response = await request(app).get('/api/productos');
        
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        expect(response.body).toHaveProperty('resultados');
    });
});