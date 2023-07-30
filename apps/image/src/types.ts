export interface QueueProps {
    name: string;
    routingKey: string;
    exchange: string;
}

export type ImageCommands = 'create_image' | 'add_token_to_image';
export interface Message {
    command: ImageCommands;
    sagaId: string;
}

export enum status {
    'pending',
    'completed',
    'failed'
}

export type Status = keyof typeof status;

export interface SagaStepResponse {
    command: ImageCommands;
    status: Status;
    sagaId: string;
    payload: Record<string, any>;
}
