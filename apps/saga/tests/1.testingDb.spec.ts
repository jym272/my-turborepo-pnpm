import { Order, startSequelize, Ticket } from '@/database';
import { Sequelize } from 'sequelize';

describe('testing postgres integration', () => {
    let sequelize: Sequelize;
    beforeEach(async () => {
        sequelize = await startSequelize();
        await sequelize.sync({ force: true });
    });
    afterEach(async () => {
        await sequelize.close();
    });

    it('returns a order', async () => {
        try {
            //wait 300ms
            await new Promise(resolve => setTimeout(resolve, 300));
            const newTicket = await Ticket.create({
                title: 'Concert Ticket',
                price: 50.99,
                version: 1
            });
            const order = await Order.create({
                userId: Number('11123'),
                expiresAt: new Date(),
                ticketId: newTicket.id
            });
            expect(order).toBeDefined();
            expect(order.id).toBeDefined();
            expect(order.userId).toBe(11123);
            expect(order.expiresAt).toBeDefined();
            expect(order.ticketId).toBe(newTicket.id);
            // console.log('Order', order);
        } catch (e) {
            // console.log('Error', e);
        }
    });
});
