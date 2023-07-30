export const ChronoLogger = {
    checkpoints: new Map<string, number>(),

    time(checkpointName: string) {
        if (this.checkpoints.has(checkpointName)) {
            console.error(`Checkpoint '${checkpointName}' already exists.`);
            throw new Error(`Checkpoint '${checkpointName}' already exists.`);
        }

        this.checkpoints.set(checkpointName, Date.now());
    },

    measure(checkpointName: string): string {
        const startTime = this.checkpoints.get(checkpointName);
        if (startTime === undefined) {
            console.error(`Checkpoint '${checkpointName}' not found.`);
            throw new Error(`Checkpoint '${checkpointName}' not found.`);
        }

        const elapsedTime = Date.now() - startTime;
        return `Elapsed time at '${checkpointName}': ${elapsedTime}ms`;
    }
};

/*

Example of use:

-> Set the time with a unique checkpoint name:
ChronoLogger.time('checkpoint_1');

 // some long lines of code

 // -> Measure the time elapsed since the checkpoint:
console.log(ChronoLogger.measure('checkpoint_1')):

 // some long lines of code

 // -> Measure the time elapsed since the checkpoint:
console.log(ChronoLogger.measure('checkpoint_1'));

 */
