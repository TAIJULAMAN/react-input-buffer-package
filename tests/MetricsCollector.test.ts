import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsCollector } from '../src/metrics/MetricsCollector';

describe('MetricsCollector', () => {
    let collector: MetricsCollector;

    beforeEach(() => {
        collector = new MetricsCollector();
    });

    it('should initialize with default metrics', () => {
        const metrics = collector.getMetrics();

        expect(metrics.pollingRate).toBe('unknown');
        expect(metrics.rawEventCount).toBe(0);
        expect(metrics.flushedEventCount).toBe(0);
        expect(metrics.reductionPercentage).toBe(0);
    });

    it('should record raw events', () => {
        collector.recordRawEvent();
        collector.recordRawEvent();

        const metrics = collector.getMetrics();
        expect(metrics.rawEventCount).toBe(2);
    });

    it('should record flushed events', () => {
        collector.recordFlushedEvent();

        const metrics = collector.getMetrics();
        expect(metrics.flushedEventCount).toBe(1);
    });

    it('should calculate reduction percentage correctly', () => {
        // Simulate 100 raw events, 10 flushed
        for (let i = 0; i < 100; i++) {
            collector.recordRawEvent();
        }
        for (let i = 0; i < 10; i++) {
            collector.recordFlushedEvent();
        }

        const metrics = collector.getMetrics();
        expect(metrics.reductionPercentage).toBe(90);
    });

    it('should update polling rate', () => {
        collector.updatePollingRate('high', 8000);

        const metrics = collector.getMetrics();
        expect(metrics.pollingRate).toBe('high');
        expect(metrics.detectedHz).toBe(8000);
    });

    it('should track processing times', () => {
        collector.recordProcessingTime(1.5);
        collector.recordProcessingTime(2.5);

        const metrics = collector.getMetrics();
        expect(metrics.averageProcessingTime).toBe(2.0);
    });

    it('should reset all metrics', () => {
        collector.recordRawEvent();
        collector.recordFlushedEvent();
        collector.updatePollingRate('high', 8000);

        collector.reset();

        const metrics = collector.getMetrics();
        expect(metrics.rawEventCount).toBe(0);
        expect(metrics.flushedEventCount).toBe(0);
        expect(metrics.pollingRate).toBe('unknown');
    });
});
