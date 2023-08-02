import { AvailableMicroservices } from '@/Saga/RefactorSaga2';
type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';
export interface Data {
    command: string;
    micro: AvailableMicroservices;
}

interface NodeData extends Data {
    response: Record<string, any>;
    status: Status;
    //isCurrentStep: boolean;
}
// MAQUINA DE ESTADOS
export class LinkedListNode {
    data: NodeData;
    // eslint-disable-next-line no-use-before-define
    next: LinkedListNode | null;
    // eslint-disable-next-line no-use-before-define
    previous: LinkedListNode | null;

    constructor(data: Data) {
        this.data = {
            ...data,
            response: {},
            status: 'pending'
        };
        this.next = null;
        this.previous = null;
    }

    updateResponse(response: Record<string, any>) {
        this.data.response = response;
    }

    updateStatus(status: Status) {
        this.data.status = status;
    }

    getData() {
        return this.data;
    }

    getResponse() {
        return this.data.response;
    }
}

export class LinkedList {
    head: LinkedListNode | null;
    current: LinkedListNode | null;

    constructor() {
        this.head = null;
        this.current = null; // Initialize the current pointer to null (not pointing to any node)
    }

    append(data: Data) {
        const newNode = new LinkedListNode(data);
        if (!this.head) {
            this.head = newNode;
            this.current = newNode; // If it's the first node, set it as the current node.
        } else {
            let currentNode = this.head;
            while (currentNode.next !== null) {
                currentNode = currentNode.next;
            }
            currentNode.next = newNode;
            newNode.previous = currentNode; // Set the `previous` property of the newly added node.
        }
    }
    getCurrentNode(): LinkedListNode | null {
        return this.current;
    }
    linkedListToJson() {
        const json: Record<string, any>[] = [];
        let currentNode = this.head;
        while (currentNode !== null) {
            json.push(currentNode.getData());
            currentNode = currentNode.next;
        }
        return json;
    }

    traverseAndConsoleLogData() {
        let currentNode = this.head;
        while (currentNode !== null) {
            console.log(currentNode.data);
            currentNode = currentNode.next;
        }
    }
    moveToNext() {
        if (this.current?.next) {
            this.current = this.current.next;
        }
    }
}
export const buildLinkedList = (linkedListData: Data[]) => {
    const linkedList = new LinkedList();
    linkedListData.forEach(data => linkedList.append(data));
    return linkedList;
};
