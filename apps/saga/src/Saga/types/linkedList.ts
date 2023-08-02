export type ImageCommands = 'create_image' | 'add_token_to_image';
export type MintCommands = 'mint_image' | 'add_token_to_image';
export type AvailableMicroservices = 'image' | 'mint';

export interface SagaStepResponse {
    microservice: 'image' | 'mint';
    command: ImageCommands | MintCommands;
    status: 'success' | 'failure' | 'completed';
    sagaId: number;
    payload: Record<string, any>;
}



export type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';
export interface Data {
    command: string;
    micro: AvailableMicroservices;
}

export interface NodeData extends Data {
    response: Record<string, any>;
    status: Status;
    isCurrentStep: boolean; // mas bien deberia ser una TODO PROP DE LA CLASE
}
