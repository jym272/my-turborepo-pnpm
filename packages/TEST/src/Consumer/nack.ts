import { ConsumeMessage } from 'amqplib';
import { MAX_NACK_RETRIES, NACKING_DELAY_MS } from '../constants';
import { getConsumeChannel } from '../Connections';
import { Exchange } from '../@types';

/**
 * Apply delayed nack mechanism to a message, optionally retrying a limited number of times.
 *
 * @param {ConsumeMessage} msg - The message to be nacked.
 * @param {string} queueName - The name of the queue from which the message was consumed.
 * @param {number} [delay=NACKING_DELAY_MS] - The delay in milliseconds before requeuing the message.
 * @param {number} [maxRetries=MAX_NACK_RETRIES] - The maximum number of nack retries allowed.
 * @returns {Promise<number>} The count of nack retries performed.
 * @throws {Error} If there are issues with the consume channel, publishing the message, or exceeding max retries.
 *
 * @example
 * const msg = ... // ConsumeMessage from RabbitMQ
 * const queueName = 'my_queue';
 * const delay = 5000; // 5 seconds
 * const maxRetries = 3;
 * const nackCount = await nackWithDelay(msg, queueName, delay, maxRetries);
 * console.log(`Message nacked with ${nackCount} retries`);
 *
 * @see MAX_NACK_RETRIES
 * @see NACKING_DELAY_MS
 * @see SagaConsumeChannel
 * @see MicroserviceConsumeChannel
 */
export const nackWithDelay = async (
    msg: ConsumeMessage,
    queueName: string,
    delay: number = NACKING_DELAY_MS,
    maxRetries: number = MAX_NACK_RETRIES
): Promise<number> => {
    const channel = await getConsumeChannel();
    channel.nack(msg, false, false); // nack without requeueing immediately

    let count = 1;
    if (msg.properties.headers['x-death']) {
        count = msg.properties.headers['x-death'][0].count + 1;
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
        console.error(`MAX NACK RETRIES REACHED: ${maxRetries} - NACKING ${queueName} - ${msg.content.toString()}`);
        return maxRetries;
    }

    channel.publish(Exchange.Requeue, `${queueName}_routing_key`, msg.content, {
        expiration: delay,
        headers: msg.properties.headers
    });
    return count;
};
