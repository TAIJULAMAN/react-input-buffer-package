import { AccumulatedDeltas, EventHandler } from '../types';

/**
 * Buffers events and flushes them at monitor refresh rate using requestAnimationFrame
 */
export class SamplingBuffer {
    private latestEvent: Event | null = null;
    private accumulatedDeltas: AccumulatedDeltas = { deltaX: 0, deltaY: 0, deltaZ: 0 };
    private rafId: number | null = null;
    private flushCallback: EventHandler;
    private shouldAccumulateDeltas: boolean;
    private isActive: boolean = true;

    constructor(onFlush: EventHandler, accumulateDeltas: boolean = true) {
        this.flushCallback = onFlush;
        this.shouldAccumulateDeltas = accumulateDeltas;
    }

    /**
     * Buffer an incoming event
     */
    buffer(event: Event): void {
        if (!this.isActive) return;

        // Store latest event, discarding previous
        this.latestEvent = event;

        // Accumulate deltas for scroll/wheel events
        if (this.shouldAccumulateDeltas && this.isScrollEvent(event)) {
            const wheelEvent = event as WheelEvent;
            this.accumulatedDeltas.deltaX += wheelEvent.deltaX;
            this.accumulatedDeltas.deltaY += wheelEvent.deltaY;
            this.accumulatedDeltas.deltaZ += wheelEvent.deltaZ;
        }

        // Schedule flush if not already scheduled
        if (this.rafId === null) {
            this.rafId = requestAnimationFrame(() => this.flush());
        }
    }

    /**
     * Stop buffering and cancel pending flushes
     */
    destroy(): void {
        this.isActive = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.latestEvent = null;
        this.accumulatedDeltas = { deltaX: 0, deltaY: 0, deltaZ: 0 };
    }

    /**
     * Check if event is a scroll-type event
     */
    private isScrollEvent(event: Event): boolean {
        return event.type === 'wheel' || event.type === 'scroll';
    }

    /**
     * Flush buffered event to callback
     */
    private flush(): void {
        if (this.latestEvent) {
            // Pass accumulated deltas if available
            const deltas =
                this.shouldAccumulateDeltas && this.isScrollEvent(this.latestEvent)
                    ? { ...this.accumulatedDeltas }
                    : undefined;

            this.flushCallback(this.latestEvent, deltas);

            // Reset state
            this.latestEvent = null;
            this.accumulatedDeltas = { deltaX: 0, deltaY: 0, deltaZ: 0 };
        }
        this.rafId = null;
    }
}
