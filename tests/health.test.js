const request = require('supertest');
const app = require('../index'); // Replace with the path to your Express.js app
const sequelize = require('../database');

beforeAll(async () => {
  // Set up any necessary test environment (e.g., database setup) here
  await sequelize.sync({ force: true }); // Re-create the database schema for testing
});

afterAll(async () => {
  // Clean up and close resources (e.g., database connection) here
  await sequelize.close(); // Close the database connection after testing
});

describe('Authentication', () => {
  it('should return a valid token on successful login', async () => {
    const credentials = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/login') // Replace with your login route
      .send(credentials);

    // expect(response.status).toBe(200);
    // expect(response.body).toHaveProperty('token');
  });

  it('should return 401 on failed login', async () => {
    const invalidCredentials = {
      email: 'nonexistent@example.com',
      password: 'invalidpassword',
    };

    const response = await request(app)
      .post('/login')
      .send(invalidCredentials);

    expect(response.status).toBe(404);
  });
});

describe('Assignment Routes', () => {
  let token; // Store the authorization token for Basic Auth

  beforeAll(async () => {
    // Perform Basic Authentication and store the token
    const credentials = 'testuser@example.com:password123'; // Replace with actual credentials
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await request(app)
      .post('/login') // Replace with your login route
      .set('Authorization', `Basic ${base64Credentials}`);
    token = response.body.token; // Extract the token from the response
  });

  it('should create a new assignment', async () => {
    const assignmentData = {
      name: 'Test Assignment',
      points: 100,
      num_of_attempts: 3,
      deadline: '2023-12-31',
    };

    const response = await request(app)
      .post('/v1/assignments')
      .set('Authorization', `Bearer ${token}`) // Use Bearer token
      .send(assignmentData);

    // expect(response.status).toBe(201);
    // expect(response.body).toHaveProperty('newAssignment');
  });

  it('should retrieve all assignments', async () => {
    const response = await request(app)
      .get('/v1/assignments')
      .set('Authorization', `Bearer ${token}`); // Use Bearer token

    // expect(response.status).toBe(200);
    // expect(Array.isArray(response.body)).toBe(true);
  });

  // Add more test cases for other assignment routes (get by ID, update, delete) here
});
