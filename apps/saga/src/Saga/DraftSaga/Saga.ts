// El proceso Saga es una máquina de estados, cada paso tiene un estado
// el, proceso es lineal paso a paso, cada vez que se envía eventos
// a las micros se realiza persistencia en postgresql

/*

  Saga
  - name: test_saga
  - micros -> 2 images y mint
  - steps:
        - step1 -> guardar imagen en image
        - step2 -> mintear imagen guardada en step1
        - step3 -> confirmar al saga el minteo
        - finished!
 */

import { getSequelizeClient, Saga } from '@/db';
import { SagaStepResponse } from '@/Saga';
import { sendToQueue } from 'rabbit-mq11111';

type AvailableMicroservices = 'image' | 'mint';

interface SagaStep {
    status: string;
    command: string;
    response: Record<string, any>;
    micro: AvailableMicroservices;
    currentStep: boolean;
    nextStep: string;
    previousStep: string;
}
const queues: Record<AvailableMicroservices, Record<'name', string>> = {
    mint: {
        name: 'mint_saga_commands'
    },
    image: {
        name: 'image_saga_commands'
    }
};

const sequelize = getSequelizeClient();

const createSaga = async () => {
    let newSaga: Saga;
    try {
        newSaga = await sequelize.transaction(async () => {
            return await Saga.create({
                dataSaga: {}
            });
        });
        return newSaga;
    } catch (err) {
        throw Error("Can't create Saga");
    }
};

const updateSagaStepSate = async (id: number, dataSaga: Record<string, any>) => {
    try {
        await sequelize.transaction(async () => {
            const saga = await Saga.findByPk(id);
            if (!saga) {
                throw Error("Can't find Saga");
            }
            await saga.update({ dataSaga });
        });
    } catch (err) {
        throw Error("Can't update Saga");
    }
};

// podria hacer una transaccion tambien y asegurarme que solo yo  la obtenga
const getSaga = async (id: number) => {
    try {
        const saga = await Saga.findByPk(id);
        if (!saga) {
            throw Error("Can't find Saga");
        }
        return saga;
    } catch (err) {
        throw Error("Can't find Saga");
    }
};

const updateCurrentStep = (dataSaga: Saga, payload: Record<string, any>) => {
    const currentStep = Object.keys(dataSaga).find(step => {
        return dataSaga[step].currentStep === true;
    });
    console.log('currentStep', currentStep);

    dataSaga[currentStep].status = 'success';
    dataSaga[currentStep].currentStep = false;
    dataSaga[currentStep].response = payload;

    return dataSaga[currentStep].nextStep;
};

// happy path -> if continueNextStepSaga is invoked, is because status is success
export const continueNextStepSaga = async (response: SagaStepResponse) => {
    // el payload del response va al siguiente paso!
    const { sagaId, status, payload } = response;
    const thisSaga = await getSaga(sagaId);
    console.log('thisSaga', thisSaga.dataSaga, response);

    const nextStep = updateCurrentStep(thisSaga.dataSaga);

    if (nextStep === 'finished') {
        console.log('FINSIHED SAGA');
        return;
    }


    //Send to Queue
    const nextMicro = thisSaga.dataSaga[nextStep].micro;
    const brokerData = queues[nextMicro];

    await sendToQueue(brokerData.name, {
        command: thisSaga.dataSaga[nextStep].command,
        sagaId: thisSaga.id,
        payload
    });

    // update next saga in DB
    thisSaga.dataSaga[nextStep].currentStep = true;
    thisSaga.dataSaga[nextStep].status = 'sent';
    await updateSagaStepSate(thisSaga.id, thisSaga.dataSaga);
};

export const SagaProcess = async () => {
    // inicio el SAGA en base de datos con el estado inicial
    const newSaga = await createSaga(); // crear un saga que tengas steps definidos
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

    const micro = dataSaga.step1.micro;
    const brokerData = queues[micro];

    dataSaga.step1.status = 'sent';
    await updateSagaStepSate(newSaga.id, dataSaga);
    await sendToQueue(brokerData.name, { command: dataSaga.step1.command, sagaId: newSaga.id, payload: {} });
};
