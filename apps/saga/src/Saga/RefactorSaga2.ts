import { sendToQueue } from 'rabbit-mq11111';
import { getSequelizeClient, Saga as SagaModel } from '@/db';
import { buildLinkedList, Data, LinkedList, LinkedListNode } from '@/Saga/RefactorSaga2LinkedList';
export type ImageCommands = 'create_image' | 'add_token_to_image';
export type MintCommands = 'mint_image' | 'add_token_to_image';
export type AvailableMicroservices = 'image' | 'mint';

const queues: Record<AvailableMicroservices, Record<'name', string>> = {
    mint: {
        name: 'mint_saga_commands'
    },
    image: {
        name: 'image_saga_commands'
    }
};
export interface SagaStepResponse {
    microservice: 'image' | 'mint';
    command: ImageCommands | MintCommands;
    status: 'success' | 'failure' | 'completed';
    sagaId: number;
    payload: Record<string, any>;
}

const createSaga = async () => {
    let newSaga: SagaModel;
    try {
        newSaga = await getSequelizeClient().transaction(async () => {
            return await SagaModel.create({
                dataSaga: {}
            });
        });
        return newSaga;
    } catch (err) {
        throw Error("Can't create Saga");
    }
};

const persistsStep = async (id: number, dataSaga: LinkedList) => {
    console.log('2', dataSaga.linkedListToJson());
    try {
        await getSequelizeClient().transaction(async () => {
            const saga = await SagaModel.findByPk(id);
            if (!saga) {
                throw Error("Can't find Saga");
            }
            await saga.update({ dataSaga: dataSaga.linkedListToJson() });
        });
    } catch (err) {
        console.log(err);
        throw Error("Can't update Saga");
    }
};

export class Saga {
    private readonly currentStepNode: LinkedListNode | null;

    constructor(public sagaId: number, public stepsList: LinkedList) {
        this.currentStepNode = stepsList.traverseAndGetCurrentNode();
    }

    public async startSaga() {
        if (this.currentStepNode === null) {
            console.log('No current step found.');
            return;
        }
        this.currentStepNode.updateStatus('sent');
        await this.persistsSagaStep();
        this.sendStepToQueue(this.currentStepNode);
    }

    public async continueNextStep(response: SagaStepResponse): Promise<void> {
        const { status, payload } = response;
        const currentStep = this.currentStepNode;
        if (!currentStep) {
            console.log('No current step found.');
            return;
        }

        currentStep.updateStatus(status).updateResponse(payload);

        // puedo chequear el final pero tendria que actualizar antes de finalizar
        if (currentStep.next === null) {
            console.log('Finished Saga.');
            return;
        }
        currentStep.next.updateStatus('sent').setCurrentStep();
        await this.persistsSagaStep();
        this.sendStepToQueue(currentStep.next);
    }

    private async persistsSagaStep() {
        await persistsStep(this.sagaId, this.stepsList);
    }

    private sendStepToQueue(step: LinkedListNode): void {
        const { micro, command } = step.getData();
        const brokerData = queues[micro];

        sendToQueue(brokerData.name, {
            command,
            sagaId: this.sagaId,
            payload: step.getResponse() // better name fro respponse TODO
        })
            .then(() => {
                console.log(`Step "${step}" sent to queue.`);
            })
            .catch(error => {
                console.error('Error sending step to queue:', error);
            });
    }
}

export class SagaManager {
    public static async createSaga(steps: LinkedList): Promise<Saga> {
        try {
            const newSaga = await this.createSagaInDatabase();
            return new Saga(newSaga.id, steps);
        } catch (err) {
            throw new Error("Can't create Saga");
        }
    }
    public static continueNextStepSaga = async (response: SagaStepResponse) => {
        const sagaModel = await this.getSaga(response.sagaId);
        const linkedList = LinkedList.jsonToLinkedList(sagaModel.dataSaga);
        const saga = new Saga(sagaModel.id, linkedList);
        await saga.continueNextStep(response);
    };

    private static async createSagaInDatabase() {
        return await createSaga();
    }

    private static getSaga = async (id: number) => {
        try {
            const saga = await SagaModel.findByPk(id);
            if (!saga) {
                throw Error("Can't find Saga");
            }
            return saga;
        } catch (err) {
            throw Error("Can't find Saga");
        }
    };
}

const dataForNodeInLinkedList: Data[] = [
    {
        command: 'create_image',
        micro: 'image'
    },
    {
        command: 'mint_image',
        micro: 'mint'
    },
    {
        command: 'update_token',
        micro: 'image'
    }
];

export const SagaProcessLinkedList = async () => {
    const linkedList = buildLinkedList(dataForNodeInLinkedList);
    linkedList.head?.setCurrentStep();
    const saga = await SagaManager.createSaga(linkedList);
    console.log('Saga created');
    await saga.startSaga();
    console.log('SagaProcess has begun', saga.sagaId);
};
