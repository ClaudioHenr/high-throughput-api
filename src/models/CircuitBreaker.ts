
type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
    private state: State = 'CLOSED';

    private failureCount: number = 0;
    private successCount: number = 0;
    private lastFailureTime: number = 0;

    constructor(
        private failureThreshold: number = 3,
        private successThreshold: number = 2,
        private openTimeout: number = 10000 // in milliseconds
    ) {}

    canExecute(): boolean {
        if (this.state === 'OPEN') {
        if (this.isOpenTimeoutExceeded()) {
            this.state = 'HALF_OPEN'
            return true
        }
        return false
        }

        return true
    }

    private isOpenTimeoutExceeded(): boolean {
        return Date.now() - this.lastFailureTime > this.openTimeout;
    }


    onSuccess() {
        this.failureCount = 0
        this.state = 'CLOSED'
    }

    onFailure() {
        this.failureCount++

        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN'
            this.lastFailureTime = Date.now()
        }
    }

    getState() {
        return this.state
    }
}