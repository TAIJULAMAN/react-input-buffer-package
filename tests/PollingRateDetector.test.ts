import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PollingRateDetector } from '../src/detection/PollingRateDetector';

describe('PollingRateDetector', () => {
    let detector: PollingRateDetector;
    let mockTime = 0;

    beforeEach(() => {
        detector = new PollingRateDetector();
        mockTime = 0;

        // Mock performance.now
        vi.spyOn(performance, 'now').mockImplementation(() => mockTime);
    });

    it('should return unknown with insufficient samples', () => {
        const event = new PointerEvent('pointermove');
        const result = detector.detectPollingRate(event);
        expect(result).toBe('unknown');
    });

    it('should detect high polling rate devices', () => {
        const event = new PointerEvent('pointermove');

        // Simulate 8,000Hz (0.125ms intervals)
        for (let i = 0; i < 10; i++) {
            mockTime += 0.125;
            detector.detectPollingRate(event);
        }

        const result = detector.detectPollingRate(event);
        expect(result).toBe('high');
        expect(detector.getDetectedHz()).toBeGreaterThan(1000);
    });

    it('should detect standard polling rate devices', () => {
        const event = new PointerEvent('pointermove');

        // Simulate 125Hz (8ms intervals)
        for (let i = 0; i < 10; i++) {
            mockTime += 8;
            detector.detectPollingRate(event);
        }

        const result = detector.detectPollingRate(event);
        expect(result).toBe('standard');
        expect(detector.getDetectedHz()).toBeLessThan(200);
    });

    it('should cache polling rate after detection', () => {
        const event = new PointerEvent('pointermove');

        // Detect as high polling
        for (let i = 0; i < 10; i++) {
            mockTime += 0.125;
            detector.detectPollingRate(event);
        }

        const firstResult = detector.detectPollingRate(event);
        const secondResult = detector.detectPollingRate(event);

        expect(firstResult).toBe(secondResult);
    });

    it('should reset detector state', () => {
        const event = new PointerEvent('pointermove');

        for (let i = 0; i < 10; i++) {
            mockTime += 0.125;
            detector.detectPollingRate(event);
        }

        detector.reset();
        const result = detector.detectPollingRate(event);

        expect(result).toBe('unknown');
        expect(detector.getDetectedHz()).toBe(0);
    });
});
