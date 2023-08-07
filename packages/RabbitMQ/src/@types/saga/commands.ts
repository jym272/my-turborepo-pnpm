import { AvailableMicroservices } from './microservices';

export enum ImageCommands {
    CreateImage = 'create_image',
    UpdateToken = 'update_token'
}

export enum MintCommands {
    MintImage = 'mint_image'
}

export interface CommandMap {
    [AvailableMicroservices.Image]: ImageCommands;
    [AvailableMicroservices.Mint]: MintCommands;
}

export interface MicroserviceCommand<T extends AvailableMicroservices> {
    command: CommandMap[T];
    microservice: T;
}
