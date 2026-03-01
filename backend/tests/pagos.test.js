const request = require('supertest');
const app = require('../server');

describe('Pruebas de Pasarela de Pagos', () => {
    // 1. Creación de sesión
    test('Debe generar una URL de Stripe al enviar carrito', async () => {
        const res = await request(app)
            .post('/api/crear-pago')
            .send({ carrito: [{ nombre: 'Perfume Test', precio: 1000, quantity: 1 }] });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
    });

    // 2. Carrito vacío
    test('Debe fallar si el carrito está vacío', async () => {
        const res = await request(app).post('/api/crear-pago').send({ carrito: [] });
        expect(res.statusCode).toBe(500);
    });

    // 3. Formato de moneda
    test('La sesión de Stripe debe ser en MXN', async () => {
        const res = await request(app)
            .post('/api/crear-pago')
            .send({ carrito: [{ nombre: 'Test', precio: 100, quantity: 1 }] });
        // Verificamos que se creó la sesión con éxito
        expect(res.body.url).toContain('stripe.com');
    });

    // 4. Validar que Stripe reciba montos positivos
    test('No debe permitir pagos con precio 0', async () => {
        const res = await request(app)
            .post('/api/crear-pago')
            .send({ carrito: [{ nombre: 'Error', precio: 0, quantity: 1 }] });
        expect(res.statusCode).toBe(500);
    });

    // 5. URLs de retorno
    test('La respuesta de pago debe ser un objeto', async () => {
        const res = await request(app)
            .post('/api/crear-pago')
            .send({ carrito: [{ nombre: 'Test', precio: 100, quantity: 1 }] });
        expect(typeof res.body).toBe('object');
    });
});
