import React, { useEffect, useRef, useCallback } from 'react';
import { InputSanitizerProps, SupportedEventType } from '../types';
import { PollingRateDetector } from '../detection/PollingRateDetector';
import { MetricsCollector } from '../metrics/MetricsCollector';
import { SamplingBuffer } from '../buffer/SamplingBuffer';
import { EventInterceptor } from '../interceptor/EventInterceptor';
import { YieldScheduler } from '../scheduler/YieldScheduler';

const DEFAULT_EVENT_TYPES: SupportedEventType[] = [
    'pointermove',
    'wheel',
    'touchmove',
    'scroll',
];

/**
 * InputSanitizer - Provider component that buffers high-frequency input events
 * 
 * Wraps your application to automatically buffer input events from high-polling-rate
 * devices (e.g., 8,000Hz gaming mice), syncing them to your monitor's refresh rate.
 * 
 * @example
 * ```tsx
 * <InputSanitizer sampleRate="auto" priority="user-visible">
 *   <App />
 * </InputSanitizer>
 * ```
 */
export const InputSanitizer: React.FC<InputSanitizerProps> = ({
    sampleRate = 'auto',
    priority = 'user-visible',
    eventTypes = DEFAULT_EVENT_TYPES,
    accumulateDeltas = true,
    debug = false,
    onMetrics,
    children,
}) => {
    const detectorRef = useRef<PollingRateDetector | null>(null);
    const metricsRef = useRef<MetricsCollector | null>(null);
    const bufferRef = useRef<SamplingBuffer | null>(null);
    const interceptorRef = useRef<EventInterceptor | null>(null);
    const schedulerRef = useRef<YieldScheduler | null>(null);
    const metricsIntervalRef = useRef<number | null>(null);

    // Initialize all components
    useEffect(() => {
        detectorRef.current = new PollingRateDetector();
        metricsRef.current = new MetricsCollector();
        schedulerRef.current = new YieldScheduler();

        // Create buffer with flush callback
        const handleFlush = async (event: Event, deltas?: any) => {
            const startTime = performance.now();

            // Use scheduler to yield if needed
            await schedulerRef.current?.processWithYield(() => {
                // Event has been flushed to React
                if (metricsRef.current) {
                    metricsRef.current.recordFlushedEvent();
                    metricsRef.current.updateFPS();
                }
            }, priority);

            // Record processing time
            const processingTime = performance.now() - startTime;
            metricsRef.current?.recordProcessingTime(processingTime);
        };

        bufferRef.current = new SamplingBuffer(handleFlush, accumulateDeltas);

        // Create interceptor
        const shouldBuffer = (event: Event): boolean => {
            // Record raw event
            metricsRef.current?.recordRawEvent();

            // Detect polling rate on pointer events
            if (event instanceof PointerEvent && detectorRef.current) {
                const pollingRate = detectorRef.current.detectPollingRate(event);
                const detectedHz = detectorRef.current.getDetectedHz();
                metricsRef.current?.updatePollingRate(pollingRate, detectedHz);

                if (debug) {
                    console.log(
                        `[InputSanitizer] Polling Rate: ${pollingRate} (${detectedHz}Hz)`
                    );
                }
            }

            // Always buffer events
            return true;
        };

        const handleEvent = (event: Event) => {
            bufferRef.current?.buffer(event);
        };

        interceptorRef.current = new EventInterceptor(
            eventTypes,
            shouldBuffer,
            handleEvent
        );

        // Set up metrics reporting if callback provided
        if (onMetrics || debug) {
            metricsIntervalRef.current = window.setInterval(() => {
                const metrics = metricsRef.current?.getMetrics();
                if (metrics) {
                    if (debug) {
                        console.log('[InputSanitizer] Metrics:', metrics);
                    }
                    onMetrics?.(metrics);
                }
            }, 1000); // Report every second
        }

        // Cleanup
        return () => {
            interceptorRef.current?.detach();
            bufferRef.current?.destroy();
            if (metricsIntervalRef.current !== null) {
                clearInterval(metricsIntervalRef.current);
            }
        };
    }, [sampleRate, priority, eventTypes, accumulateDeltas, debug, onMetrics]);

    return <>{children}</>;
};
