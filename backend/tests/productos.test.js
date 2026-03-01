const request = require('supertest');

// Connect directly to the running server at localhost:4000
const api = request('http://localhost:4000');

describe('Pruebas de Catálogo de Productos', () => {
  test('Debe obtener todos los productos', async () => {
    const res = await api.get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // server returns rows directly
  });

  test('Los productos deben tener nombre y precio', async () => {
    const res = await api.get('/api/productos');
    const producto = res.body[0];
    expect(producto).toHaveProperty('nombre');
    expect(producto).toHaveProperty('precio_50');
  });

  test('Debe responder con éxito al consultar categorías', async () => {
    const res = await api.get('/api/productos');
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('El stock debe estar definido y ser un número', async () => {
    const res = await api.get('/api/productos');
    expect(res.body[0]).toHaveProperty('stock_50');
    expect(typeof res.body[0].stock_50).toBe('number');
  });

  test('La ruta de productos no debe estar vacía', async () => {
    const res = await api.get('/api/productos');
    expect(res.body).not.toBeNull();
  });
});
