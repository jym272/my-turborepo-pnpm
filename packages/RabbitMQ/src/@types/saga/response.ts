import { AvailableMicroservices } from './microservices';
import ConsumeChannel from '../../Consumer/channels/Consume';
import { CommandMap, MicroserviceCommand } from './commands';

export enum Status {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Sent = 'sent'
}

export interface SagaStepDefaults {
    status: Status;
    payload: Record<string, any>;
    previousPayload: Record<string, any>;
    isCurrentStep: boolean;
}

export interface SagaStep<T extends AvailableMicroservices> extends SagaStepDefaults, MicroserviceCommand<T> {
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
