const request = require('supertest');
const app = require('../server'); // Asegúrate de que la ruta sea correcta

describe('Pruebas de Autenticación y Roles', () => {
    
    // 1. Login exitoso: Prueba que el sistema genera un token con datos válidos
    test('Debe iniciar sesión y devolver un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ 
                nombre: 'admin1', 
                password: 'admin123' 
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    // 2. Login fallido: Verifica que el sistema rechace credenciales erróneas
    test('Debe rechazar login con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ 
                nombre: 'admin1', 
                password: 'password_incorrecto_123' 
            });
        expect(res.statusCode).toBe(400);
    });

    // 3. Verificación de Rol Admin: Comprueba que el usuario tiene privilegios
    test('El usuario admin1 debe tener rol de admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ 
                nombre: 'admin1', 
                password: 'admin123' 
            });
        // Si el login es exitoso, verificamos el campo 'rol'
        expect(res.body.rol).toBe('admin');
    });

    // 4. Bloqueo de ruta protegida: Asegura que no se pueda entrar sin token
    test('Debe dar 401 si se intenta ver pedidos sin token', async () => {
        const res = await request(app).get('/api/pedidos');
        expect(res.statusCode).toBe(401);
    });

    // 5. Registro duplicado: Forzamos un error 400 usando un email que ya existe
    test('No debe permitir registrar un email ya existente', async () => {
        const res = await request(app)
            .post('/api/auth/registro')
            .send({ 
                nombre: 'Roberto', 
                email: 'rob@gmail.com', // Debe ser uno que ya esté en Atlas
                password: 'jajasalu2' 
            });
        // Esperamos 400 porque el servidor detecta que el email ya está ocupado
        expect(res.statusCode).toBe(400);
    });
});