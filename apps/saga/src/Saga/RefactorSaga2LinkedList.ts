import { AvailableMicroservices } from '@/Saga/RefactorSaga2';

type Status = 'pending' | 'success' | 'failure' | 'sent' | 'completed';
interface Data {
    command: string;
    micro: AvailableMicroservices;
}

interface NodeData extends Data {
    response: Record<string, any>;
    status: Status;
}

class LinkedListNode {
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
}

class LinkedList {
    head: LinkedListNode | null;

    constructor() {
        this.head = null;
    }

    append(data: Data) {
        const newNode = new LinkedListNode(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next !== null) {
                current = current.next;
            }
            current.next = newNode;
            newNode.previous = current; // Set the `previous` property of the newly added node.
        }
    }
}

// Given dataForNodeInLinkedList
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

const buildLinkedList = () => {
    const linkedList = new LinkedList();
    dataForNodeInLinkedList.forEach(data => linkedList.append(data));
    return linkedList;
};
