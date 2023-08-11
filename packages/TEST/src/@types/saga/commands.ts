import { AvailableMicroservices } from './microservices';
/**
 * Different commands related to the "Image" microservice.
 */
export enum ImageCommands {
    /**
     * Command to create an image.
     */
    CreateImage = 'create_image',
    /**
     * Command to update a token for an image.
     */
    UpdateToken = 'update_token'
}
/**
 * Different commands related to the "Mint" microservice.
 */
export enum MintCommands {
    /**
     * Command to mint an image.
     */
    MintImage = 'mint_image'
}
/**
 * A map that defines the relationship between microservices and their corresponding commands.
 */
export interface CommandMap {
    /**
     * Represents the mapping of "Image" microservice commands.
     */
    [AvailableMicroservices.Image]: ImageCommands;
    /**
     * Represents the mapping of "Mint" microservice commands.
     */
    [AvailableMicroservices.Mint]: MintCommands;
}
/**
 * Represents a command specific to a microservice.
 * T - The type of microservice for which the command is intended.
 * @template T
 */
export interface MicroserviceCommand<T extends AvailableMicroservices> {
    /**
     * The specific command associated with the microservice.
     */
    command: CommandMap[T];
    /**
     * The microservice to which the command belongs.
     */
    microservice: T;
}
