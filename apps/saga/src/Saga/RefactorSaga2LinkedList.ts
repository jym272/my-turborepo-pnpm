import { AvailableMicroservices } from '@/Saga/RefactorSaga2';
// TODO: revisar bien los status de la maquina de estados
// TODO: tanto en micros como en saga
// TODO: tipear todo lo que haya que tipear
type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';
export interface Data {
    command: string;
    micro: AvailableMicroservices;
}

export interface NodeData extends Data {
    response: Record<string, any>;
    status: Status;
    isCurrentStep: boolean; // mas bien deberia ser una TODO PROP DE LA CLASE
}
// MAQUINA DE ESTADOS
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

export class LinkedList {
    head: LinkedListNode | null;
    current: LinkedListNode | null;

    constructor() {
        this.head = null;
        this.current = null; // Initialize the current pointer to null (not pointing to any node)
    }

    appendData(data: Data) {
        //Default values
        const nodeData: NodeData = {
            ...data,
            response: {},
            status: 'pending',
            isCurrentStep: false
        };
        this.append(new LinkedListNode(nodeData));
    }

    append(newNode: LinkedListNode) {
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
    appendNodeData(nodeData: NodeData) {
        this.append(new LinkedListNode(nodeData));
    }
    getCurrentNode(): LinkedListNode | null {
        return this.current;
    }
    linkedListToJson() {
        const json: NodeData[] = [];
        let currentNode = this.head;
        while (currentNode !== null) {
            json.push(currentNode.getData());
            currentNode = currentNode.next;
        }
        return json;
    }

    static jsonToLinkedList(json: NodeData[]) {
        const linkedList = new LinkedList();
        json.forEach(data => linkedList.appendNodeData(data));
        return linkedList;
    }

    traverseAndGetCurrentNode() {
        let currentNode = this.head;
        while (currentNode !== null) {
            if (currentNode.data.isCurrentStep) {
                return currentNode;
            }
            currentNode = currentNode.next;
        }
        return null;
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
//podría ser un static methdo en la calse LinkedList
export const buildLinkedList = (linkedListData: Data[]) => {
    const linkedList = new LinkedList();
    linkedListData.forEach(data => linkedList.appendData(data));
    return linkedList;
};
