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
import { Broker } from 'rabbit-mq';

const queues = {
    mint: {
        name: 'mint_saga_commands',
        routingKey: 'mint_micro'
    },
    image: {
        name: 'image_saga_commands',
        routingKey: 'image_micro_commands'
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
        // const error = parseSequelizeError(err, `Creating Saga failed.`);
        // throwError('Creating Saga failed.', HttpStatusCode.InternalServerError, error);
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

export interface Command {
    command: string;
    sagaId: number;
    payload: Record<string, any>;
}

// continue implica que fue un exito, talves antes de llegar aca habria asegurarse que fue exitoso
export const continueNextStepSaga = async (response: SagaStepResponse) => {
    const { command, sagaId, status, payload } = response;
    const thisSaga = await getSaga(sagaId);
    console.log('thisSaga', thisSaga.dataSaga, response);
    const currentStep = Object.keys(thisSaga.dataSaga).find(step => {
        return thisSaga.dataSaga[step].currentStep === true;
    });
    console.log('currentStep', currentStep);
    thisSaga.dataSaga[currentStep].status = status;
    thisSaga.dataSaga[currentStep].currentStep = false;
    thisSaga.dataSaga[currentStep].response = payload;
    const nexStep = thisSaga.dataSaga[currentStep].nextStep;
    if (nexStep === 'finished') {
        console.log('FINSIHED SAGA');
        return;
    }
    console.log('asd', nexStep, thisSaga.dataSaga[nexStep]);

    thisSaga.dataSaga[nexStep].currentStep = true;
    const micro = thisSaga.dataSaga[nexStep].micro;
    const brokerData = queues[micro];
    console.log('brokerData', brokerData, thisSaga.dataSaga);

    const broker = new Broker(brokerData.name);
    // await broker.connect();

    const result = await broker.sendToQueue({
        command: thisSaga.dataSaga[nexStep].command,
        sagaId: thisSaga.id,
        payload
    });
    if (result) {
        thisSaga.dataSaga[nexStep].status = 'sent';
        await updateSagaStepSate(thisSaga.id, thisSaga.dataSaga);
    } else {
        console.error('Error sending command to image micro');
        // error
    }

    broker.cleanUp();
};

export const SagaProcess = async () => {
    // inicio el SAGA en base de datos con el estado inicial
    const newSaga = await createSaga(); // crear un saga que tengas steps definidos
    console.log('SagaProcess has begun', newSaga.id);
    const dataSaga = {
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

    const broker = new Broker(brokerData.name);
    // await broker.connect();
    // parece mas relevante este dataSaga -> al final del dia parece que es el que da todas las instrucciones

    const result = await broker.sendToQueue({ command: dataSaga.step1.command, sagaId: newSaga.id, payload: {} });
    if (result) {
        dataSaga.step1.status = 'sent';
        await updateSagaStepSate(newSaga.id, dataSaga);
    } else {
        console.error('Error sending command to image micro');
        // error
    }

    broker.cleanUp();
    // envío el comando a la micro de imagen para guardar cierta imagen.
    // envía la orden y persisto en base de datos el estado
    // cada micro escucha en su correspondiente queue
    /* PERSISTENCIA EN BASE DE DATOS
    Que guardo ?
    - id de la saga
    - estado de la saga
    - id de la orden
    - estado de la orden







     */
};

// en un proceso aparte escucho los eventos de la micro de imagen -> reply channel
// este reply channel continua con el saga
