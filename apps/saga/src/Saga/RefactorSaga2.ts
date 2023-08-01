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

const updateSagaStepSate = async (id: number, dataSaga: LinkedList) => {
    try {
        await getSequelizeClient().transaction(async () => {
            const saga = await SagaModel.findByPk(id);
            if (!saga) {
                throw Error("Can't find Saga");
            }
            await saga.update({ dataSaga });
        });
    } catch (err) {
        throw Error("Can't update Saga");
    }
};

export class Saga {
    private currentStepNode: LinkedListNode | null;

    constructor(public sagaId: number, public stepsList: LinkedList) {
        this.currentStepNode = stepsList.head;
    }

    public async startSaga() {
        this.currentStepNode?.updateStatus('sent');
        await this.updateSagaStepState();
        this.sendCurrentStepToQueue();
    }

    public async continueNextStep(response: SagaStepResponse): Promise<void> {
        const { status, payload } = response;
        const currentStep = this.currentStepNode;
        if (!currentStep) {
            console.log('No current step found.');
            return;
        }

        currentStep.updateStatus(status);
        currentStep.updateResponse(payload);

        // puedo chequear el final pero tendria que actualizar antes de finalizar
        if (currentStep.next === null) {
            console.log('Finished Saga.');
            return;
        }
        this.currentStepNode = currentStep.next; //UPDATING NEXT CURRENT STEP!!!
        this.currentStepNode.updateStatus('sent');
        await this.updateSagaStepState();
        this.sendCurrentStepToQueue();
    }

    private async updateSagaStepState() {
        await updateSagaStepSate(this.sagaId, this.stepsList);
    }

    private sendCurrentStepToQueue(): void {
        const currentStep = this.currentStepNode;
        if (!currentStep) {
            console.log('No current step found.');
            return;
        }

        const { micro, command } = currentStep.getData();
        const brokerData = queues[micro];

        sendToQueue(brokerData.name, {
            command,
            sagaId: this.sagaId,
            payload: currentStep.getResponse()
        })
            .then(() => {
                console.log(`Step "${this.currentStepNode}" sent to queue.`);
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

    private static async createSagaInDatabase() {
        return await createSaga();
    }
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

const getSaga = async (id: number) => {
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
export const continueNextStepSaga = async (response: SagaStepResponse) => {
    const thisSaga = await getSaga(response.sagaId);
};

export const SagaProcess = async () => {
    const linkedList = buildLinkedList(dataForNodeInLinkedList);
    const saga = await SagaManager.createSaga(linkedList);
    console.log('Saga created:', saga);
    await saga.startSaga();
    console.log('SagaProcess has begun', saga.sagaId);
};
