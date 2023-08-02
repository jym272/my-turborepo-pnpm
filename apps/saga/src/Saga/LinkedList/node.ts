// TODO: revisar bien los status de la maquina de estados
// TODO: tanto en micros como en saga
// TODO: tipear todo lo que haya que tipear

// MAQUINA DE ESTADOS

import { NodeData, Status } from '@/Saga';

export class LinkedListNode {
    data: NodeData;
    // eslint-disable-next-line no-use-before-define
    next: LinkedListNode | null;
    // eslint-disable-next-line no-use-before-define
    previous: LinkedListNode | null;

    constructor(data: NodeData) {
        this.data = {
            ...data
        };
        this.next = null;
        this.previous = null;
    }

    updateResponse(response: Record<string, any>) {
        this.data.response = response;
        return this;
    }

    updateStatus(status: Status) {
        this.data.status = status;
        return this;
    }
    setCurrentStep() {
        this.data.isCurrentStep = true;
        if (this.previous) {
            this.previous.data.isCurrentStep = false;
        }
        return this;
    }

    getData() {
        return this.data;
    }

    getResponse() {
        return this.data.response;
    }
}
