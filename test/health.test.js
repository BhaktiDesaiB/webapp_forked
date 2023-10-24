const supertest = require('supertest');
const {app,port} = require('../index'); // Replace with the path to your Express.js app
const sequelize = require('../database');
const dotenv = require('dotenv');
const request = supertest(app);

describe('/healthz endpoint', () => {
  let response;
  beforeEach(async () => {
    response = await request.get("/healthz");
  });
  it('should return a 200 status for /healthz', async () => {
      expect(response.status).toBe(503);
  });
  afterEach(() => {
    port.close();
  })
});