// TODO: refactor all this in types in main

export type ImageCommands = 'create_image' | 'update_token';
export type MintCommands = 'mint_image';
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

export interface NodeDataDefaults {
    response: Record<string, any>;
    status: Status;
    isCurrentStep: boolean;
}

export interface NodeData extends MicroserviceCommand, NodeDataDefaults {}

export const nodeDataDefaults: NodeDataDefaults = {
    response: {},
    status: 'pending',
    isCurrentStep: false
};
// TODO: refactor this, is weird
export const queues: Record<AvailableMicroservices, Record<'name', string>> = {
    mint: {
        name: 'mint_saga_commands'
    },
    image: {
        name: 'image_saga_commands'
    }
};
