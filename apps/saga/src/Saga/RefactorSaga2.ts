import { sendToQueue } from 'rabbit-mq11111';
import { getSequelizeClient, Saga as SagaModel } from '@/db';

export type ImageCommands = 'create_image' | 'add_token_to_image';
export type MintCommands = 'mint_image' | 'add_token_to_image';
export type AvailableMicroservices = 'image' | 'mint';

const queues: Record<'image' | 'mint', Record<'name', string>> = {
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
type stepName = string;
export interface SagaStep {
    status: string;
    command: string;
    response: Record<string, any>;
    micro: AvailableMicroservices;
    currentStep: boolean;
    nextStep: stepName | 'finished';
    previousStep: string;
}
export class SagaStepData {
    status: 'pending' | 'success' | 'failure' | 'sent' | 'completed' = 'pending';
    response: Record<string, any> = {};

    constructor(public micro: AvailableMicroservices, public command: string, public nextStep: stepName | 'finished') {
        //
    }
}

type DataSaga = Record<stepName, SagaStep>;

const createSaga = async (dataSaga: DataSaga) => {
    let newSaga: SagaModel;
    try {
        newSaga = await getSequelizeClient().transaction(async () => {
            return await SagaModel.create({
                dataSaga
            });
        });
        return newSaga;
    } catch (err) {
        throw Error("Can't create Saga");
    }
};

const updateSagaStepSate = async (id: number, dataSaga: DataSaga) => {
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
    private steps: Record<stepName, SagaStepData> = {};
    private currentStepName: stepName | null = null;

    constructor(public sagaId: number) {
        //
    }

    public addStep(name: stepName, micro: AvailableMicroservices, command: string, nextStep: stepName): void {
        this.steps[name] = new SagaStepData(micro, command, nextStep);
    }

    public getStep(name: string): SagaStepData | undefined {
        return this.steps[name];
    }

    public getCurrentStep(): SagaStepData | undefined {
        return this.currentStepName ? this.steps[this.currentStepName] : undefined;
    }

    public async startSaga() {
        const startStep: stepName = Object.keys(this.steps)[0];
        if (startStep) {
            this.currentStepName = startStep;
            this.steps[startStep].status = 'sent';
            await this.updateSagaStepState();
            this.sendCurrentStepToQueue();
        }
    }

    public async continueNextStep(response: SagaStepResponse): Promise<void> {
        const { status, payload } = response;
        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            console.log('No current step found.');
            return;
        }

        currentStep.status = status;
        currentStep.response = payload;

        const nextStepName = currentStep.nextStep;
        if (!nextStepName) {
            console.log('Finished Saga.');
            return;
        }

        this.currentStepName = nextStepName;
        this.steps[nextStepName].status = 'sent';
        await this.updateSagaStepState();
        this.sendCurrentStepToQueue();
    }

    private async updateSagaStepState() {
        await updateSagaStepSate(this.sagaId, this.steps);
    }

    private sendCurrentStepToQueue(): void {
        const currentStep = this.getCurrentStep();
        if (!currentStep) {
            console.log('No current step found.');
            return;
        }

        const { micro, command } = currentStep;
        const brokerData = queues[micro];

        sendToQueue(brokerData.name, {
            command,
            sagaId: this.sagaId,
            payload: currentStep.response
        })
            .then(() => {
                console.log(`Step "${this.currentStepName}" sent to queue.`);
            })
            .catch(error => {
                console.error('Error sending step to queue:', error);
            });
    }
}

const dataSaga: DataSaga = {
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
        status: 'pending', //uso la response de step1
        command: 'mint_image',
        response: {},
        micro: 'mint',
        currentStep: false,
        nextStep: 'step3',
        previousStep: 'step1'
    },
    step3: {
        status: 'pending', //uso la response de step2
        command: 'update_token',
        response: {},
        micro: 'image',
        currentStep: false,
        nextStep: 'finished',
        previousStep: 'step2'
    }
};

export class SagaManager {
    public static async createSaga(steps: Record<stepName, SagaStep>): Promise<Saga> {
        try {
            const newSaga = await this.createSagaInDatabase({});
            const saga = new Saga(newSaga.id);
            for (const stepName in steps) {
                if (Object.prototype.hasOwnProperty.call(steps, stepName)) {
                    const step = steps[stepName];
                    saga.addStep(stepName, step.micro, step.command, step.nextStep);
                }
            }
            return saga;
        } catch (err) {
            throw new Error("Can't create Saga");
        }
    }

    private static async createSagaInDatabase(dataSaga: DataSaga) {
        return await createSaga(dataSaga);
    }
}

export const SagaProcess = async () => {
    const saga = await SagaManager.createSaga(dataSaga);
    console.log('Saga created:', saga);
    await saga.startSaga();
    console.log('SagaProcess has begun', saga.sagaId);
};
