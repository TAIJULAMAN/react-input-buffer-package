import { Metrics, PollingRate } from '../types';

/**
 * Collects and reports performance metrics for debugging and monitoring
 */
export class MetricsCollector {
    private metrics: Metrics;
    private frameTimestamps: number[] = [];
    private eventProcessingTimes: number[] = [];
    private readonly MAX_FRAME_SAMPLES = 60;
    private readonly MAX_PROCESSING_SAMPLES = 100;

    constructor() {
        this.metrics = {
            pollingRate: 'unknown',
            detectedHz: 0,
            rawEventCount: 0,
            flushedEventCount: 0,
            reductionPercentage: 0,
            currentFPS: 0,
            averageProcessingTime: 0,
            timestamp: performance.now(),
        };
    }

    /**
     * Record a raw event received
     */
    recordRawEvent(): void {
        this.metrics.rawEventCount++;
        this.updateReductionPercentage();
    }

    /**
     * Record an event that was flushed to React
     */
    recordFlushedEvent(): void {
        this.metrics.flushedEventCount++;
        this.updateReductionPercentage();
    }

    /**
     * Record event processing time
     */
    recordProcessingTime(timeMs: number): void {
        this.eventProcessingTimes.push(timeMs);

        // Keep only recent samples
        if (this.eventProcessingTimes.length > this.MAX_PROCESSING_SAMPLES) {
            this.eventProcessingTimes.shift();
        }

        this.updateAverageProcessingTime();
    }

    /**
     * Update FPS measurement (call this in rAF loop)
     */
    updateFPS(): void {
        const now = performance.now();
        this.frameTimestamps.push(now);

        // Keep last N frames
        if (this.frameTimestamps.length > this.MAX_FRAME_SAMPLES) {
            this.frameTimestamps.shift();
        }

        // Calculate FPS
        if (this.frameTimestamps.length >= 2) {
            const duration = now - this.frameTimestamps[0];
            this.metrics.currentFPS = Math.round(
                ((this.frameTimestamps.length - 1) / duration) * 1000
            );
        }
    }

    /**
     * Update polling rate information
     */
    updatePollingRate(pollingRate: PollingRate, detectedHz: number): void {
        this.metrics.pollingRate = pollingRate;
        this.metrics.detectedHz = detectedHz;
    }

    /**
     * Get current metrics snapshot
     */
    getMetrics(): Metrics {
        return {
            ...this.metrics,
            timestamp: performance.now(),
        };
    }

    /**
     * Reset all metrics
     */
    reset(): void {
        this.metrics = {
            pollingRate: 'unknown',
            detectedHz: 0,
            rawEventCount: 0,
            flushedEventCount: 0,
            reductionPercentage: 0,
            currentFPS: 0,
            averageProcessingTime: 0,
            timestamp: performance.now(),
        };
        this.frameTimestamps = [];
        this.eventProcessingTimes = [];
    }

    /**
     * Calculate event reduction percentage
     */
    private updateReductionPercentage(): void {
        if (this.metrics.rawEventCount === 0) {
            this.metrics.reductionPercentage = 0;
            return;
        }

        const filtered = this.metrics.rawEventCount - this.metrics.flushedEventCount;
        this.metrics.reductionPercentage = Math.round(
            (filtered / this.metrics.rawEventCount) * 100
        );
    }

    /**
     * Calculate average processing time
     */
    private updateAverageProcessingTime(): void {
        if (this.eventProcessingTimes.length === 0) {
            this.metrics.averageProcessingTime = 0;
            return;
        }

        const sum = this.eventProcessingTimes.reduce((acc, time) => acc + time, 0);
        this.metrics.averageProcessingTime = sum / this.eventProcessingTimes.length;
    }
}
