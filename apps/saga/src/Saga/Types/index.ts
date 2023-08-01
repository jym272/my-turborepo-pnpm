export type ImageCommands = 'create_image' | 'add_token_to_image';
export type MintCommands = 'mint_image' | 'add_token_to_image';

export interface SagaStepResponse {
    microservice: 'image' | 'mint';
    command: ImageCommands | MintCommands;
    status: 'success' | 'failure' | 'completed';
    sagaId: number;
    payload: Record<string, any>;
}
