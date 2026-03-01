const request = require('supertest');
const app = require('../server');

describe('Pruebas de Catálogo de Productos', () => {
  test('Debe obtener todos los productos', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.resultados)).toBe(true);
  });

  test('Los productos deben tener nombre y precio', async () => {
    const res = await request(app).get('/api/productos');
    const producto = res.body.resultados[0];
    expect(producto).toHaveProperty('nombre');
    expect(producto).toHaveProperty('precio_50');
  });

  test('Debe responder con éxito al consultar categorías', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.body.resultados.length).toBeGreaterThan(0);
  });

  test('El stock debe estar definido y ser un número', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.body.resultados[0]).toHaveProperty('stock_50');
    expect(typeof res.body.resultados[0].stock_50).toBe('number');
  });

  test('La ruta de productos no debe estar vacía', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.body.resultados).not.toBeNull();
  });
});