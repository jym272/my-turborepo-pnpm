import { getSequelizeClient, Saga as SagaModel } from '@/db';
import { MicroserviceCommand, SagaStepResponse } from '@/Saga/types';
import { LinkedList } from '@/Saga/LinkedList';
import { SagaProcess } from '@/Saga/Process';

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

export class SagaManager {
    public static process = async (commands: MicroserviceCommand[]) => {
        const linkedList = LinkedList.build(commands);
        linkedList.head?.setCurrentStep();
        const saga = await this.createSaga(linkedList);
        console.log('Saga created');
        await saga.start();
        console.log('SagaProcess has begun', saga.sagaId);
    };
    public static async createSaga(steps: LinkedList): Promise<SagaProcess> {
        try {
            const newSaga = await this.createSagaInDatabase();
            return new SagaProcess(newSaga.id, steps);
        } catch (err) {
            throw new Error("Can't create Saga");
        }
    }

    // TODO: continue nextStep or previousStep -> if transaction in a step fails
    public static continue = async (response: SagaStepResponse) => {
        const sagaModel = await this.getSaga(response.sagaId);
        const linkedList = LinkedList.jsonToLinkedList(sagaModel.dataSaga);
        const saga = new SagaProcess(sagaModel.id, linkedList);
        await saga.continue(response);
    };

    private static async createSagaInDatabase() {
        return await createSaga();
    }

    // TODO: refactor -> getting also blocking and using a transaction!!
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
