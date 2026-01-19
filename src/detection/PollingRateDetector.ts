import { PollingRate } from '../types';

/**
 * Detects high-polling-rate input devices using sub-millisecond timestamp analysis
 */
export class PollingRateDetector {
    private eventTimestamps: number[] = [];
    private readonly SAMPLE_SIZE = 10;
    private readonly HIGH_POLLING_THRESHOLD = 1; // ms
    private readonly HIGH_POLLING_COUNT_THRESHOLD = 5;
    private cachedPollingRate: PollingRate | null = null;
    private detectedHz: number = 0;

    /**
     * Detect polling rate from a pointer event
     * @param event - The pointer event to analyze
     * @returns Polling rate classification
     */
    detectPollingRate(event: PointerEvent): PollingRate {
        // Return cached result if already detected
        if (this.cachedPollingRate) {
            return this.cachedPollingRate;
        }

        const now = performance.now();
        this.eventTimestamps.push(now);

        // Keep only recent samples
        if (this.eventTimestamps.length > this.SAMPLE_SIZE) {
            this.eventTimestamps.shift();
        }

        // Need enough samples to make a determination
        if (this.eventTimestamps.length < this.SAMPLE_SIZE) {
            return 'unknown';
        }

        // Calculate deltas between consecutive events
        const deltas = this.calculateDeltas();
        const highPollingCount = deltas.filter(
            (d) => d < this.HIGH_POLLING_THRESHOLD
        ).length;

        // Determine polling rate
        if (highPollingCount >= this.HIGH_POLLING_COUNT_THRESHOLD) {
            this.cachedPollingRate = 'high';
            this.detectedHz = this.estimateHz(deltas);
        } else {
            this.cachedPollingRate = 'standard';
            this.detectedHz = this.estimateHz(deltas);
        }

        return this.cachedPollingRate;
    }

    /**
     * Get the detected polling rate in Hz
     */
    getDetectedHz(): number {
        return this.detectedHz;
    }

    /**
     * Reset the detector (useful when device changes)
     */
    reset(): void {
        this.eventTimestamps = [];
        this.cachedPollingRate = null;
        this.detectedHz = 0;
    }

    /**
     * Calculate time deltas between consecutive events
     */
    private calculateDeltas(): number[] {
        const deltas: number[] = [];
        for (let i = 1; i < this.eventTimestamps.length; i++) {
            deltas.push(this.eventTimestamps[i] - this.eventTimestamps[i - 1]);
        }
        return deltas;
    }

    /**
     * Estimate polling rate in Hz from deltas
     */
    private estimateHz(deltas: number[]): number {
        if (deltas.length === 0) return 0;

        // Calculate average delta
        const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;

        // Convert to Hz (1000ms / avgDelta)
        return avgDelta > 0 ? Math.round(1000 / avgDelta) : 0;
    }
}
