import { useRef, useCallback, useEffect } from 'react';
import { UseInputBufferOptions, AccumulatedDeltas } from '../types';
import { SamplingBuffer } from '../buffer/SamplingBuffer';

/**
 * Hook for component-level event buffering
 * 
 * Alternative to InputSanitizer for granular control over specific components.
 * 
 * @example
 * ```tsx
 * function Canvas() {
 *   const handleMove = useInputBuffer((event: PointerEvent) => {
 *     // This will be called at monitor refresh rate
 *     updateCursor(event.clientX, event.clientY);
 *   }, { sampleRate: 'auto' });
 * 
 *   return <canvas onPointerMove={handleMove} />;
 * }
 * ```
 */
export function useInputBuffer<T extends Event>(
    handler: (event: T, deltas?: AccumulatedDeltas) => void,
    options: UseInputBufferOptions = {}
): (event: T) => void {
    const { sampleRate = 'auto', accumulateDeltas = true } = options;

    const bufferRef = useRef<SamplingBuffer | null>(null);
    const handlerRef = useRef(handler);

    // Keep handler ref up to date
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    // Initialize buffer
    useEffect(() => {
        const handleFlush = (event: Event, deltas?: AccumulatedDeltas) => {
            handlerRef.current(event as T, deltas);
        };

        bufferRef.current = new SamplingBuffer(handleFlush, accumulateDeltas);

        return () => {
            bufferRef.current?.destroy();
        };
    }, [accumulateDeltas]);

    // Return buffered event handler
    const bufferedHandler = useCallback((event: T) => {
        bufferRef.current?.buffer(event);
    }, []);

    return bufferedHandler;
}
