import { getSequelizeClient, Saga as SagaModel } from '@/db';
import { Data, SagaStepResponse } from '@/Saga/types';
import { LinkedList } from '@/Saga/LinkedList';
import { Saga } from '@/Saga/Process';

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

export class SagaManager {
    public static processLinkedList = async () => {
        const linkedList = LinkedList.buildLinkedList(dataForNodeInLinkedList);
        linkedList.head?.setCurrentStep();
        const saga = await this.createSaga(linkedList);
        console.log('Saga created');
        await saga.startSaga();
        console.log('SagaProcess has begun', saga.sagaId);
    };
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
