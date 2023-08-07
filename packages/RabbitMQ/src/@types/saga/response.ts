import { ImageCommands, MintCommands } from './commands';
import { AvailableMicroservices } from './microservices';
import ConsumeChannel from '../../Consumer/channels/Consume';

export enum Status {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Sent = 'sent'
}

export interface CommandMap {
    [AvailableMicroservices.Image]: ImageCommands;
    [AvailableMicroservices.Mint]: MintCommands;
}

export interface SagaStep<T extends AvailableMicroservices> {
    microservice: T;
    command: CommandMap[T]; // This ensures the correct command type based on the microservice
    status: Status;
    sagaId: number;
    payload: Record<string, any>;
    previousPayload: Record<string, any>;
    isCurrentStep: boolean;
}

export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: { sagaId: number; payload: Record<string, any>; channel: ConsumeChannel<T> };
};

export type ConsumerSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: { step: SagaStep<T>; channel: ConsumeChannel<T> };
};
