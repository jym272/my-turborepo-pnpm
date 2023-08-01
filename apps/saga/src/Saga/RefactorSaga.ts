import { getSequelizeClient, Saga as SagaModel } from '@/db';
import { SagaStepResponse } from '@/Saga';
import { sendToQueue } from 'rabbit-mq11111';

interface Queue {
    name: string;
}

interface SagaStep {
    status: string;
    command: string;
    response: Record<string, any>;
    micro: string;
    currentStep: boolean;
    nextStep: string;
    previousStep: string;
}

export class Saga {
    static queues: Record<string, Queue> = {
        mint: { name: 'mint_saga_commands' },
        image: { name: 'image_saga_commands' }
    };

    private static sequelize = getSequelizeClient();

    static async create(): Promise<SagaModel> {
        try {
            return await this.sequelize.transaction(async () => {
                return await SagaModel.create({
                    dataSaga: {}
                });
            });
        } catch (err) {
            throw new Error("Can't create Saga");
        }
    }

    static async updateSagaStepState(id: number, dataSaga: Record<string, SagaStep>) {
        try {
            await this.sequelize.transaction(async () => {
                const saga = await SagaModel.findByPk(id);
                if (!saga) {
                    throw new Error("Can't find Saga");
                }
                await saga.update({ dataSaga });
            });
        } catch (err) {
            throw new Error("Can't update Saga");
        }
    }

    static async continueNextStepSaga(response: SagaStepResponse) {
        const { command, sagaId, status, payload } = response;
        const thisSaga = await this.getSaga(sagaId);
        console.log('thisSaga', thisSaga.dataSaga, response);

        const currentStep = Object.keys(thisSaga.dataSaga).find(step => thisSaga.dataSaga[step].currentStep === true);
        console.log('currentStep', currentStep);

        this.updateStepStatus(thisSaga, currentStep, status, payload);

        const nextStep = thisSaga.dataSaga[currentStep].nextStep;
        if (nextStep === 'finished') {
            console.log('FINISHED SAGA');
            return;
        }

        this.updateStepStatus(thisSaga, nextStep, 'sent', payload);
        const micro = thisSaga.dataSaga[nextStep].micro;
        const brokerData = this.queues[micro];
        console.log('brokerData', brokerData, thisSaga.dataSaga);

        await sendToQueue(brokerData.name, {
            command: thisSaga.dataSaga[nextStep].command,
            sagaId: thisSaga.id,
            payload
        });

        await this.updateSagaStepState(thisSaga.id, thisSaga.dataSaga);
    }

    private static async getSaga(id: number): Promise<SagaModel> {
        try {
            const saga = await SagaModel.findByPk(id);
            if (!saga) {
                throw new Error("Can't find Saga");
            }
            return saga;
        } catch (err) {
            throw new Error("Can't find Saga");
        }
    }

    private static updateStepStatus(saga: SagaModel, step: string, status: string, payload: Record<string, any>) {
        saga.dataSaga[step].status = status;
        saga.dataSaga[step].currentStep = false;
        saga.dataSaga[step].response = payload;
    }
}

export const SagaProcessRefactor = async () => {
    // Create a new Saga with predefined steps
    const newSaga = await Saga.create();
    console.log('SagaProcess has begun', newSaga.id);

    const dataSaga: Record<string, SagaStep> = {
        step1: {
            status: 'pending',
            command: 'create_image',
            response: {},
            micro: 'image',
            currentStep: true,
            nextStep: 'step2',
            previousStep: 'start'
        },
        step2: {
            status: 'pending',
            command: 'mint_image',
            response: {},
            micro: 'mint',
            currentStep: false,
            nextStep: 'step3',
            previousStep: 'step1'
        },
        step3: {
            status: 'pending',
            command: 'update_token',
            response: {},
            micro: 'image',
            currentStep: false,
            nextStep: 'finished',
            previousStep: 'step2'
        }
    };

    const micro = dataSaga.step1.micro;
    const brokerData = Saga.queues[micro];

    dataSaga.step1.status = 'sent';
    await Saga.updateSagaStepState(newSaga.id, dataSaga);
    await sendToQueue(brokerData.name, {
        command: dataSaga.step1.command,
        sagaId: newSaga.id,
        payload: {}
    });
};
