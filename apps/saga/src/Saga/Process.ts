import { AvailableMicroservices, SagaStepResponse } from '@/Saga/types';
import { LinkedList, LinkedListNode } from '@/Saga/LinkedList';
import { sendToQueue } from 'rabbit-mq11111';
import { getSequelizeClient, Saga as SagaModel } from '@/db';

const queues: Record<AvailableMicroservices, Record<'name', string>> = {
    mint: {
        name: 'mint_saga_commands'
    },
    image: {
        name: 'image_saga_commands'
    }
};

const persistsStep = async (id: number, dataSaga: LinkedList) => {
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
        // TODO: esto dos es un solo proceso!!!
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
        console.log(this.sagaId, this.stepsList.linkedListToJson());
        // puedo chequear el final pero tendria que actualizar antes de finalizar
        if (currentStep.next === null) {
            // TODO: persist?
            console.log('Finished Saga: ', this.sagaId);
            return;
        }
        currentStep.next.updateStatus('sent').setCurrentStep();
        await this.persistsSagaStep(); //siempre tendría que ser persist and sedn!"
        this.sendStepToQueue(currentStep.next);
    }

    // better name, actually all saga is persisted
    private async persistsSagaStep() {
        await persistsStep(this.sagaId, this.stepsList);
    }

    // SEND oR SEND!!!  it cannot fail!, already persisted
    private sendStepToQueue(step: LinkedListNode): void {
        const { micro, command } = step.getData();
        const brokerData = queues[micro];

        sendToQueue(brokerData.name, {
            command,
            sagaId: this.sagaId,
            payload: step.getResponse() // better name fro respponse TODO
        })
            .then(() => {
                console.log(`Step "${step.getData().command}" sent to queue.`);
            })
            .catch(error => {
                console.error('Error sending step to queue:', error);
            });
    }
}
