export type ImageCommands = 'create_image';
export type MintCommands = 'mint_image' | 'update_token';
export type Command = ImageCommands | MintCommands;
export type AvailableMicroservices = 'image' | 'mint';

export interface SagaStepResponse {
    microservice: 'image' | 'mint';
    command: ImageCommands | MintCommands;
    status: 'success' | 'failure' | 'completed';
    sagaId: number;
    payload: Record<string, any>;
}

export type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';
export interface MicroserviceCommand {
    command: Command;
    micro: AvailableMicroservices;
}

export interface NodeData extends MicroserviceCommand {
    response: Record<string, any>;
    status: Status;
    isCurrentStep: boolean; // mas bien deberia ser una TODO PROP DE LA CLASE
}
