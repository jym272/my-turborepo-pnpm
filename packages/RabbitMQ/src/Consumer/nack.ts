import { ConsumeMessage } from 'amqplib';
import { MAX_NACK_RETRIES, NACKING_DELAY_MS, REQUEUE_EXCHANGE } from '../constants';
import { getConsumeChannel } from '../connection';

export const nackWithDelay = (
    msg: ConsumeMessage,
    queueName: string,
    delay = NACKING_DELAY_MS,
    maxRetries = MAX_NACK_RETRIES
) => {
    const channel = getConsumeChannel();
    channel.nack(msg, false, false); // nack without requeueing immediately

    let count = 0;
    if (msg.properties.headers['x-death']) {
        count = msg.properties.headers['x-death'][0].count;
    }
    // console.log('nacking', msg.properties.headers['x-death'], { count });

    // TODO: x-death es un arreglo, si la lógica cambia en el desarrollo, el nacking count se implementa
    // TODO: usando un header custom, no x-death, importante, pasar los headers al publish, de otra manera
    // TODO: la cuenta en x-death no se incrementa
    // const headers = msg.properties.headers; // Get the existing headers or create an empty object if not present
    // const count = headers['x-retry-count'] ?? 0;
    // console.log('count', count);
    // headers['x-retry-count'] = count + 1;

    if (msg.properties.headers['x-death'] && msg.properties.headers['x-death'].length > 1) {
        const logData = {
            'x-death': msg.properties.headers['x-death'],
            queueName,
            msg: msg.content.toString(),
            headers: msg.properties.headers
        };
        console.warn('x-death length > 1 -> TIME TO REFACTOR', logData);
    }

    if (count > maxRetries) {
        //refactor with chalk colors
        console.warn(`MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`);
        return;
    }

    channel.publish(REQUEUE_EXCHANGE, `${queueName}_routing_key`, msg.content, {
        expiration: delay,
        headers: msg.properties.headers
    });
};
