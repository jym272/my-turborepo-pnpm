import { MicroserviceCommand, LinkedListNode, NodeData, nodeDataDefaults } from '@/Saga';

export class LinkedList {
    head: LinkedListNode | null;
    current: LinkedListNode | null;

    constructor() {
        this.head = null;
        this.current = null; // Initialize the current pointer to null (not pointing to any node)
    }

    appendData(data: MicroserviceCommand) {
        //Default values
        const nodeData: NodeData = {
            ...data,
            ...nodeDataDefaults
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
    public static buildLinkedList = (linkedListData: MicroserviceCommand[]) => {
        const linkedList = new this();
        linkedListData.forEach(data => linkedList.appendData(data));
        return linkedList;
    };
}
