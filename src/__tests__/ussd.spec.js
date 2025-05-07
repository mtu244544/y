const request = require('supertest');
const { app, server } = require('../..');

describe('POST /ussd : TEST BORROW FUEL FLOW', () => {
    it('main menu', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`CON Welcome to Yobo By Hawa\n1. Get Fuel\n2. Borrow Fuel\n3. Deposit\n4. Repay Fuel\n5. My Account\n6. Withdraw Charges`);
    });

    it('enter Amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch('Enter amount of Fuel between(UGX 3,000 to');
    });

    it('Amount and field to enter MOMOPAY CODE', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON MOMOPAY\nAmount: UGX 3,000\nEnter MOMOPAY Code for Station`);
    });

    it('FAIL for less than base amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*300',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`END amount should be greater than 3000`);
    });

    it('FAIL for greater than actual amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*300000000000',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`less since charge is UGX`);
    });

    it('field to Enter YOBOPIN', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Fuel: UGX 3,000\nCharge: UGX 0\nStation: HALIMAH\nEnter YOBO PIN to confirm`);
    });

    it('invalid password ', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 2rd retry ', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 3rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 3rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103*11111*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`END Invalid PIN try again thank you!`);
    });

    it('invalid password 4rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256777714481',
                text: '1*3000*981103*11111*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`END Invalid PIN try again thank you!`);
    });
});


describe('POST /ussd : TEST GET FUEL FLOW', () => {
    it('main menu', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual(`CON Welcome to Yobo By Hawa\n1. Get Fuel\n2. Borrow Fuel\n3. Deposit\n4. Repay Fuel\n5. My Account\n6. Withdraw Charges`);
    });

    it('enter Amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch('Enter amount of Fuel between(3,000');
    });

    it('Amount and field to enter MOMOPAY CODE', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON MOMOPAY\nAmount: UGX 3,000\nEnter MOMOPAY Code for Station`);
    });

    it('FAIL for less than base amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*300',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`END amount should be greater than 3000`);
    });

    it('FAIL for greater than actual amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*300000000000',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`Invalid Amount try again`);
    });


    it('FAIL for greater than actual amount', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*200000',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`You have exceeded Daily Limit of`);
    });

    it('field to Enter YOBOPIN', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Fuel: UGX 3,000\nCharge: UGX 800\nStation: HALIMAH\nEnter YOBO PIN to confirm`);
    });

    it('invalid password ', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 2rd retry ', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 3rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`CON Invalid PIN\nEnter a valid 4 digits YOBO PIN`);
    });
    it('invalid password 3rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103*11111*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`END Invalid PIN try again thank you!`);
    });

    it('invalid password 4rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*3000*981103*11111*11111*11111*11111',
            });
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(`END Invalid PIN try again thank you!`);
    });
    it('invalid password 4rd retry', async () => {
        const response = await request(app)
            .post('/ussd')
            .send({
                phoneNumber: '+256758307171',
                text: '2*700000*981103*11111*11111*11111*11111',
            });
        expect(response.statusCode).toBe(400);
        expect(response.text).toMatch(`END Invalid Amount try again`);
    });
});

afterAll((done) => {
    server.close(() => {
        done();
    });
});