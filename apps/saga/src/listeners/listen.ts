import { ImageConsumer } from '@/listeners/image';
import { MintConsumer } from '@/listeners/mint';

const EXCHANGE = 'reply_exchange'; // what am I consuming? -> replies, commands, notifications etc...

const imageReplySagaQueue = {
    name: 'image_saga_reply', // unique queue name
    // routingKey: 'image_micro_reply',
    exchange: EXCHANGE
};

const mintReplySagaQueue = {
    name: 'mint_saga_reply',
    // routingKey: 'mint_micro_reply',
    exchange: EXCHANGE
};
const consumers = [new ImageConsumer(imageReplySagaQueue), new MintConsumer(mintReplySagaQueue)];

export const startConsumers = async () => {
    await Promise.all(consumers.map(consumer => consumer.connect()));
    await Promise.all(consumers.map(consumer => consumer.consume()));
};

export const stopConsumers = async () => {
    await Promise.all(consumers.map(consumer => consumer.close()));
};
