import request from 'supertest';
import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: `.env.test` });

import app from '../src/index';

describe('Auth API E2E', () => {
    const number = Math.floor(Math.random() * 100) + 1;
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${number}@example.com`,
        password: 'TestPass123!'
    };

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('should signup a new user', async () => {
        const res = await request(app)
            .post('/api/v1/signup')
            .send(testUser);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe(testUser.email);
    });

    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/v1/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not login with wrong password', async () => {
        const res = await request(app)
            .post('/api/v1/login')
            .send({ email: testUser.email, password: 'WrongPass' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
