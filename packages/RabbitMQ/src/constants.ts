import { SagaStepDefaults, Status } from './@types';
export const NACKING_DELAY_MS = 2000;
// some comment here to test the behavior of the snippet
export const MAX_NACK_RETRIES = 10;

export const nodeDataDefaults: SagaStepDefaults = {
    payload: {},
    previousPayload: {},
    status: Status.Pending,
    isCurrentStep: false
};
