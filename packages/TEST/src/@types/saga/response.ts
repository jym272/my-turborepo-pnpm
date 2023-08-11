import { AvailableMicroservices } from './microservices';
import ConsumeChannel from '../../Consumer/channels/Consume';
import { CommandMap, MicroserviceCommand } from './commands';
/**
 * Represents the different statuses that a saga step can have.
 */
export enum Status {
    /**
     * The step is pending and hasn't been processed yet.
     */
    Pending = 'pending',
    /**
     * The step has been successfully executed.
     */
    Success = 'success',
    /**
     * The step execution has failed.
     */
    Failure = 'failure',
    /**
     * The step has been sent but not yet executed.
     */
    Sent = 'sent'
}
/**
 * Represents the default properties of a saga step.
 */
export interface SagaStepDefaults {
    /**
     * The status of the saga step.
     */
    status: Status;
    /**
     * The payload associated with the saga step.
     */
    payload: Record<string, any>;
    /**
     * The previous payload of the saga step.
     */
    previousPayload: Record<string, any>;
    /**
     * Indicates if the step is the current active step.
     */
    isCurrentStep: boolean;
}

/**
 * Represents a saga step for a specific microservice.
 */
export interface SagaStep<T extends AvailableMicroservices> extends SagaStepDefaults, MicroserviceCommand<T> {
    /**
     * The microservice associated with the step.
     */
    microservice: T;
    /**
     * The command type based on the microservice, ensuring correctness.
     */
    command: CommandMap[T];
    /**
     * The status of the saga step.
     */
    status: Status;
    /**
     * The ID of the saga.
     */
    sagaId: number;
    /**
     * The payload associated with the saga step.
     */
    payload: Record<string, any>;
    /**
     * The previous payload of the saga step.
     */
    previousPayload: Record<string, any>;
    /**
     * Indicates if the step is the current active step.
     */
    isCurrentStep: boolean;
}
/**
 * Represents the events emitted by a consumer for a specific microservice.
 */
export type ConsumerEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: {
        /**
         * The ID of the saga associated with the event.
         */
        sagaId: number;
        /**
         * The payload associated with the event.
         */
        payload: Record<string, any>;
        /**
         * The channel used for consuming the event.
         */
        channel: ConsumeChannel<T>;
    };
};
/**
 * Represents the saga events/events/step/command emitted by a consumer from a specific microservice to the saga.
 */
export type ConsumerSagaEvents<T extends AvailableMicroservices> = {
    [key in CommandMap[T]]: {
        /**
         * The saga step associated with the event.
         */
        step: SagaStep<T>;
        /**
         * The channel used for consuming the event.
         */
        channel: ConsumeChannel<T>;
    };
};
