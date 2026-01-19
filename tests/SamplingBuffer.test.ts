import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SamplingBuffer } from '../src/buffer/SamplingBuffer';

describe('SamplingBuffer', () => {
    let buffer: SamplingBuffer;
    let flushCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        flushCallback = vi.fn();
        buffer = new SamplingBuffer(flushCallback, true);
    });

    it('should buffer events and flush on rAF', async () => {
        const event = new Event('pointermove');

        buffer.buffer(event);

        // Wait for rAF
        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).toHaveBeenCalledWith(event, undefined);
    });

    it('should only keep latest event', async () => {
        const event1 = new Event('pointermove');
        const event2 = new Event('pointermove');

        buffer.buffer(event1);
        buffer.buffer(event2);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).toHaveBeenCalledTimes(1);
        expect(flushCallback).toHaveBeenCalledWith(event2, undefined);
    });

    it('should accumulate deltas for wheel events', async () => {
        const wheelEvent1 = new WheelEvent('wheel', { deltaX: 10, deltaY: 20 });
        const wheelEvent2 = new WheelEvent('wheel', { deltaX: 5, deltaY: 15 });

        buffer.buffer(wheelEvent1);
        buffer.buffer(wheelEvent2);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).toHaveBeenCalledWith(
            wheelEvent2,
            expect.objectContaining({
                deltaX: 15,
                deltaY: 35,
                deltaZ: 0,
            })
        );
    });

    it('should reset deltas after flush', async () => {
        const wheelEvent1 = new WheelEvent('wheel', { deltaX: 10, deltaY: 20 });
        const wheelEvent2 = new WheelEvent('wheel', { deltaX: 5, deltaY: 15 });

        buffer.buffer(wheelEvent1);
        await new Promise((resolve) => requestAnimationFrame(resolve));

        flushCallback.mockClear();

        buffer.buffer(wheelEvent2);
        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).toHaveBeenCalledWith(
            wheelEvent2,
            expect.objectContaining({
                deltaX: 5,
                deltaY: 15,
                deltaZ: 0,
            })
        );
    });

    it('should not accumulate deltas when disabled', async () => {
        const bufferNoAccumulate = new SamplingBuffer(flushCallback, false);
        const wheelEvent = new WheelEvent('wheel', { deltaX: 10, deltaY: 20 });

        bufferNoAccumulate.buffer(wheelEvent);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).toHaveBeenCalledWith(wheelEvent, undefined);
    });

    it('should cleanup on destroy', async () => {
        const event = new Event('pointermove');

        buffer.buffer(event);
        buffer.destroy();

        await new Promise((resolve) => requestAnimationFrame(resolve));

        expect(flushCallback).not.toHaveBeenCalled();
    });
});
