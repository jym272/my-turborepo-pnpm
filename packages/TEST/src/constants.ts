import { SagaStepDefaults, Status } from './@types';
/**
 * Define the nacking delay in milliseconds
 * @default
 * @constant
 */
export const NACKING_DELAY_MS = 2000;
/**
 * Define the maximum number of nack retries
 * @default
 * @constant
 */
export const MAX_NACK_RETRIES = 20;
/**
 * Define default values for saga step data using imported types
 *
 * @type {SagaStepDefaults}
 * @property {object} payload - Default payload is an empty object
 * @property {object} previousPayload - Default previous payload is an empty object
 * @property {Status} status - Default status is 'Pending' from the imported Status enum
 * @property {boolean} isCurrentStep - Default isCurrentStep is set to 'false'
 * @default
 * @constant
 */
export const nodeDataDefaults: SagaStepDefaults = {
    payload: {},
    previousPayload: {},
    status: Status.Pending,
    isCurrentStep: false
} as const;
