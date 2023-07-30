export interface Command {
    command_name: string;
    payload: any;
}

export class Saga {
    private readonly pagosCommandExchange = 'pagos_command_exchange';
    private readonly imagesCommandExchange = 'images_command_exchange';

    public async initiatePayment(payload: any) {
        const command: Command = {
            command_name: 'create_payment',
            payload: payload
        };

        await this.publishCommand(this.pagosCommandExchange, 'pagos.create_payment', command);
    }

    public async resizeImage(payload: any) {
        const command: Command = {
            command_name: 'resize_image',
            payload: payload
        };

        await this.publishCommand(this.imagesCommandExchange, 'images.resize_image', command);
    }

    private async publishCommand(exchange: string, routingKey: string, command: Command) {
        try {
            const message: Message = {
                message_name: command.command_name,
                to: [routingKey],
                payload: JSON.stringify(command.payload)
            };

            await publishMsg(exchange, message);
        } catch (error) {
            console.error('Failed to publish command:', error);
            // Handle error or retry logic as needed
        }
    }
}
