import { circuitState } from "../infra/metrics";

export enum CircuitState {
  CLOSED = 0,
  OPEN = 1,
  HALF_OPEN = 2,
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;

    private failureCount: number = 0;
    private successCount: number = 0;
    private lastFailureTime: number = 0;

    constructor(
        private readonly serviceName: string,
        private failureThreshold: number = 3,
        private successThreshold: number = 2,
        private openTimeout: number = 10000 // in milliseconds
    ) {
        circuitState.set({
            service: this.serviceName,
        }, this.state);
    }

    canExecute(): boolean {
        if (this.state === CircuitState.OPEN) {
            if (this.isOpenTimeoutExceeded()) {
                this.setState(CircuitState.HALF_OPEN)
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
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++

            if (this.successCount >= this.successThreshold) {
            this.reset()
            }
            return
        }

        this.failureCount = 0
    }

    private reset() {
        this.failureCount = 0
        this.successCount = 0
        this.setState(CircuitState.CLOSED)
    }

    onFailure() {
        this.failureCount++

        if (this.failureCount >= this.failureThreshold) {
            this.setState(CircuitState.OPEN)
            this.lastFailureTime = Date.now()
        }
    }

    getState() {
        return this.state
    }

    private setState(state: CircuitState) {
        this.state = state

        circuitState.set({
            service: this.serviceName,
        }, state)
    }
}