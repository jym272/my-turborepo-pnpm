export interface QueueProps {
    name: string;
    routingKey: string;
    exchange: string;
}

export type MintCommands = 'mint_image';
export interface Message {
    command: MintCommands;
    sagaId: string;
    payload: Record<string, any>;
}

export enum status {
    'pending',
    'completed',
    'failed'
}

export type Status = keyof typeof status;

export interface SagaStepResponse {
    microservice: 'mint';
    command: MintCommands;
    status: Status;
    sagaId: string;
    payload: Record<string, any>;
}
