const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Ensure JWT_SECRET is set before the server app (and middleware/auth) is required
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const app = require('../src/app');
const { connectDB, closeDB, getDB } = require('../src/lib/mongodb');

describe('Integration: Auth API + MongoDB', () => {
  let mongod;

  // This can take a bit on first run because mongodb-memory-server downloads binaries.
  jest.setTimeout(60000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongod.getUri();

    // Connect the app's MongoDB singleton
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    const db = getDB();
    await db.collection('users').deleteMany({});
  });

  it('register -> login -> /me (JWT)', async () => {
    const email = 'it-user@example.com';
    const password = 'secret123';
    const name = 'IT User';

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password, name });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body).toHaveProperty('token');
    expect(registerRes.body).toHaveProperty('user');
    expect(registerRes.body.user.email).toBe(email);
    expect(registerRes.body.user.role).toBe('USER');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    expect(loginRes.body).toHaveProperty('user');
    expect(loginRes.body.user.email).toBe(email);
    expect(loginRes.body.user.role).toBe('USER');

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body).toHaveProperty('user');
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.role).toBe('USER');
  });
});

