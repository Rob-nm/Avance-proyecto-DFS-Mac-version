const request = require('supertest');
const app = require('../server');

describe('Pruebas de Autenticación y Roles', () => {
    // 1. Login exitoso
    test('Debe iniciar sesión y devolver un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ nombre: 'admin1', password: 'admin123' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    // 2. Login fallido
    test('Debe rechazar login con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ nombre: 'admin1', password: 'error' });
        expect(res.statusCode).toBe(400);
    });

    // 3. Verificación de Rol Admin
    test('El usuario admin1 debe identificarse correctamente por nombre', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ nombre: 'admin1', password: 'admin123' });
        // se verifica que el usuario recibido es el administrador configurado en el frontend
        expect(res.body.usuario).toBe('admin1');
    });

    // 4. Bloqueo sin token
    test('Debe dar 401 si se intenta ver pedidos sin token', async () => {
        const res = await request(app).get('/api/pedidos');
        expect(res.statusCode).toBe(401);
    });

    // 5. Registro duplicado
    test('No debe permitir registrar un email ya existente', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ nombre: 'Test', email: 'rob@gmail.com', password: '123' });
        expect(res.statusCode).toBe(400);
    });
});