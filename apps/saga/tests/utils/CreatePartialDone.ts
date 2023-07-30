export class CreatePartialDone {
    private calls;

    constructor(private readonly doneCalls: number = 1) {
        this.calls = {
            left: doneCalls
        };
    }

    done(): void {
        this.calls = {
            left: this.calls.left - 1
        };
    }

    private callback(): void {
        if (this.calls.left === 0) {
            return;
        }
        throw new Error('Not done');
    }

    waitForDone = (timeout = 5000): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            const startTime = Date.now();

            const checkDone = () => {
                try {
                    this.callback();
                    resolve();
                } catch (error) {
                    const currentTime = Date.now();
                    if (currentTime - startTime >= timeout) {
                        reject(new Error('waitForDone timed out.'));
                    } else {
                        setTimeout(checkDone, 100);
                    }
                }
            };

            checkDone();
        });
    };
}
