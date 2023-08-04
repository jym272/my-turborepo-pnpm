import { ImageCommands, MintCommands } from './commands';
import { AvailableMicroservices } from './microservices';

export type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';

export interface CommandMap {
    [AvailableMicroservices.Image]: ImageCommands;
    [AvailableMicroservices.Mint]: MintCommands;
}
export interface SagaStepResponse<T extends AvailableMicroservices> {
    microservice: T;
    command: CommandMap[T]; // This ensures the correct command type based on the microservice
    status: Status;
    sagaId: number;
    payload: Record<string, any>;
}

// const imageStepResponse: SagaStepResponse<AvailableMicroservices.Image> = {
//     microservice: AvailableMicroservices.Image,
//     command: ImageCommands.UpdateToken,
//     status: 'pending',
//     sagaId: 12345,
//     payload: { imageName: 'example.jpg' }
// };

/*
// Example of using the SagaStepResponse type for the 'image' microservice
const imageStepResponse: SagaStepResponse<AvailableMicroservices.Image> = {
    microservice: AvailableMicroservices.Image,
    command: ImageCommands.UpdateToken,
    status: 'pending',
    sagaId: 12345,
    payload: { imageName: 'example.jpg' }
};

// Example of using the SagaStepResponse type for the 'mint' microservice
const mintStepResponse: SagaStepResponse<AvailableMicroservices.Mint> = {
    microservice: AvailableMicroservices.Mint,
    command: MintCommands.MintImage,
    status: 'success',
    sagaId: 54321,
    payload: { tokenId: 1 }
};
*/
