import { Priority } from '../types';

/**
 * Scheduler that uses the Prioritized Task Scheduling API for INP optimization
 */
export class YieldScheduler {
    /**
     * Process event with yielding to prevent main thread blocking
     */
    async processWithYield(
        callback: () => void,
        priority: Priority = 'user-visible'
    ): Promise<void> {
        // Yield to browser for high-priority tasks
        if (this.isSchedulerSupported()) {
            await this.yieldToScheduler(priority);
        } else {
            // Fallback: micro-task yield
            await this.fallbackYield();
        }

        callback();
    }

    /**
     * Check if scheduler.yield is supported
     */
    private isSchedulerSupported(): boolean {
        return (
            typeof window !== 'undefined' &&
            'scheduler' in window &&
            typeof (window.scheduler as any)?.yield === 'function'
        );
    }

    /**
     * Use scheduler.yield() if available
     */
    private async yieldToScheduler(priority: Priority): Promise<void> {
        try {
            const scheduler = (window as any).scheduler;
            if (scheduler && scheduler.yield) {
                await scheduler.yield();
            }
        } catch (error) {
            // Fallback if scheduler.yield fails
            await this.fallbackYield();
        }
    }

    /**
     * Fallback yield using setTimeout
     */
    private async fallbackYield(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, 0));
    }
}
