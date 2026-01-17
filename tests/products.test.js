const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const productController = require('../controllers/admin/productmanagement');

const app = express();
app.use(express.json());

// Routes — exactly as in your backend
app.post('/api/products', productController.createProduct);
app.get('/api/products', productController.getAllProducts);
app.get('/api/products/:id', productController.getProductById);
app.put('/api/products/:id', productController.updateProduct);
app.delete('/api/products/:id', productController.deleteProduct);

// Sample reusable IDs
const sellerId = new mongoose.Types.ObjectId();
const categoryId = new mongoose.Types.ObjectId();

describe('Product API', () => {
  let productId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb-product', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product',
        price: 99.99,
        categoryId,
        sellerId,
        description: 'Sample description',
        stock: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Product');
    productId = res.body.data._id;
  });

  it('should return 404 for non-existent product ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });

  it('should update a product by ID', async () => {
    const product = await Product.create({
      name: 'Original Product',
      price: 70,
      categoryId,
      sellerId,
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({
        name: 'Updated Product',
        price: 80,
        categoryId,
        sellerId,
        stock: 50
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Product');
  });

  it('should return 404 when updating a non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/products/${fakeId}`)
      .send({
        name: 'No Product',
        price: 99,
        categoryId,
        sellerId,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });

  it('should delete a product by ID', async () => {
    const product = await Product.create({
      name: 'To Be Deleted',
      price: 45,
      categoryId,
      sellerId,
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Product deleted');
  });

  it('should return 404 when deleting non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });

  it('should return error for invalid product ID format', async () => {
    const res = await request(app).get('/api/products/invalid-id');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Server Error');
  });

  it('should return 400 if trying to create a product without required fields', async () => {
  const res = await request(app)
    .post('/api/products')
    .field('name', '') // Empty name
    .field('price', '') // Empty price
    .field('description', '')
  expect(res.statusCode).toBeGreaterThanOrEqual(400);
  expect(res.body.success).toBe(false);
});
it('should return 404 if fetching product with non-existent ID', async () => {
  const nonExistentId = '64acdf42ec8b6a3b24aa0000'; // Fake Mongo ID
  const res = await request(app).get(`/api/products/${nonExistentId}`);
  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
});
it('should return error if invalid product ID format is used', async () => {
  const res = await request(app).get('/api/products/invalid-id-format');
  expect(res.statusCode).toBe(500); // Might throw CastError
});
it('should return 404 when getting a product by non-existent ID', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await request(app).get(`/api/products/${fakeId}`);

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Product not found');
});
it('should return 404 when deleting a product that does not exist', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await request(app).delete(`/api/products/${fakeId}`);

  expect(res.statusCode).toBe(404);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Product not found');
});

});
