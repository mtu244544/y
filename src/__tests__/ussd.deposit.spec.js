const request = require('supertest');
const { app, server } = require('../..');

describe('POST /ussd : TEST DEPOSIT AND REPAY', () => {
    it('check deposit steps', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '3',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`END Send Money to 0770383841 using 0758307171\nYour Yobo account balance will be automatically updated`);
    });

    it('check deposit steps', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '4',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`CON Enter YOBO PIN to confirm`);
    });

    it('check repay steps', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '4*0000',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`END You have no outstanding Debts`);
    });
});

afterAll((done) => {
    server.close(() => {
        done();
    });
});