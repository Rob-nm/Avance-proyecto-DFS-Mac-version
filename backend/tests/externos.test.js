const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

global.fetch = jest.fn((url) => {
    if (url.includes('exchangerate-api')) {
        if (url.includes('ZZZ')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({ 
            ok: true, 
            json: () => Promise.resolve({ rates: { USD: 0.05 } }) 
        });
    }
    if (url.includes('zippopotam.us')) {
        if (url.includes('00000')) {
            return Promise.resolve({ ok: false });
        }
        return Promise.resolve({ 
            ok: true, 
            json: () => Promise.resolve({ places: [{ 'place name': 'Monterrey', state: 'Nuevo León' }] }) 
        });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
});

describe('Pruebas de APIs Externas', () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Debe obtener tasas de cambio para MXN', async () => {
        const res = await request(app).get('/api/conversion/MXN');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('tasasDeCambio');
    });

    test('El valor del USD debe ser un número', async () => {
        const res = await request(app).get('/api/conversion/MXN');
        expect(typeof res.body.tasasDeCambio.USD).toBe('number');
    });

    test('Debe devolver ciudad para un CP válido', async () => {
        const res = await request(app).get('/api/envio/64000');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('ciudad');
    });

    test('Debe dar 404 para un CP que no existe', async () => {
        const res = await request(app).get('/api/envio/00000');
        expect(res.statusCode).toBe(404);
    });

    test('Debe manejar el caso si la moneda no existe', async () => {
        const res = await request(app).get('/api/conversion/ZZZ');
        expect(res.statusCode).toBe(200);
        expect(res.body.tasasDeCambio).toBeUndefined();
    });
});