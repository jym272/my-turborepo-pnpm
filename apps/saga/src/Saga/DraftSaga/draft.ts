// Define events and commands

class PurchaseImageNFTCommand {
    constructor(public readonly imageId: string, public readonly userId: string) {}
}

class ImageNFTPurchasedEvent {
    constructor(public readonly imageId: string) {}
}

class PaymentProcessedEvent {
    constructor(public readonly paymentId: string, public readonly imageId: string) {}
}

// Implement Saga Orchestrator -> each step listens exacyle once?

class SagaOrchestrator {
    async initiatePurchase(imageId: string, userId: string) {
        // Step 1: Initiate purchase
        const purchaseCommand = new PurchaseImageNFTCommand(imageId, userId);
        // Publish the purchase command to the event broker
        await this.eventBroker.publish(purchaseCommand);

        // Step 2: Wait for ImageNFTPurchasedEvent
        const imagePurchasedEvent = await this.eventBroker.subscribeOnce<ImageNFTPurchasedEvent>(
            'ImageNFTPurchasedEvent'
        );

        // Step 3: Process payment
        // ... handle payment processing

        // Step 4: Wait for PaymentProcessedEvent
        const paymentProcessedEvent = await this.eventBroker.subscribeOnce<PaymentProcessedEvent>(
            'PaymentProcessedEvent'
        );

        // Step 5: Complete the saga
        // ... handle completion and success actions
    }
}

// Initialize the Orchestrator and listen for events
const sagaOrchestrator = new SagaOrchestrator();

// Event handling in microservices
// ... subscribe to the commands and events from the event broker and act accordingly

// necesito orquestrar los eventos en el canal de saga_events
// saga_commands -> cada micro lanzará su propio comando que involucra cada paso
// el micro debe subscribirse a saga_commands
