export type ImageCommands = 'create_image' | 'add_token_to_image';
export type MintCommands = 'mint_image' | 'add_token_to_image';

export interface SagaStepResponse<T> {
    command: T;
    status: 'success' | 'failure' | 'completed';
    sagaId: number;
    payload: Record<string, any>;
}
