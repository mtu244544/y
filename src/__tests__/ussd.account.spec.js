const request = require('supertest');
const { app, server } = require('../..');

describe('POST /ussd : TEST ACCOUNT', () => {
    it('account Main', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '5',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`CON Account Management\n1. Account Balance\n2. Reserve Balance\n3. Account History`);
    });
    it('check Account Balance', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '5*1',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`CON Enter your PIN to confirm`);
    });

    it('check Account Balance enter invalid Pin', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '5*1*1111',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`END Invalid PIN please enter a correct PIN`);
    });

    it('check Account Balance enter Pin', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '5*1*0000',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`END Account Balance UGX 0`);
    });
});

afterAll((done) => {
    server.close(() => {
        done();
    });
});