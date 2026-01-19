/**
 * Polling rate classification for input devices
 */
export type PollingRate = 'standard' | 'high' | 'unknown';

/**
 * Task scheduling priority levels
 */
export type Priority = 'user-visible' | 'background';

/**
 * Sample rate configuration
 */
export type SampleRate = 'auto' | number;

/**
 * Supported event types for buffering
 */
export type SupportedEventType = 'pointermove' | 'wheel' | 'touchmove' | 'scroll';

/**
 * Accumulated deltas for scroll/wheel events
 */
export interface AccumulatedDeltas {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
}

/**
 * Performance metrics collected by the library
 */
export interface Metrics {
    /** Detected polling rate classification */
    pollingRate: PollingRate;
    /** Estimated device polling rate in Hz */
    detectedHz: number;
    /** Total raw events received */
    rawEventCount: number;
    /** Events actually flushed to React */
    flushedEventCount: number;
    /** Percentage of events filtered (0-100) */
    reductionPercentage: number;
    /** Current monitor refresh rate (FPS) */
    currentFPS: number;
    /** Average event processing time in milliseconds */
    averageProcessingTime: number;
    /** Timestamp when metrics were collected */
    timestamp: number;
}

/**
 * Configuration options for InputSanitizer
 */
export interface InputSanitizerProps {
    /** Sample rate - 'auto' syncs to monitor refresh, or specify custom Hz */
    sampleRate?: SampleRate;
    /** Task scheduling priority for event processing */
    priority?: Priority;
    /** Event types to buffer (default: all supported types) */
    eventTypes?: SupportedEventType[];
    /** Whether to accumulate deltas for scroll/wheel events */
    accumulateDeltas?: boolean;
    /** Enable debug mode with performance metrics logging */
    debug?: boolean;
    /** Callback for real-time metrics updates */
    onMetrics?: (metrics: Metrics) => void;
    /** Child components to wrap */
    children: React.ReactNode;
}

/**
 * Options for useInputBuffer hook
 */
export interface UseInputBufferOptions {
    /** Sample rate configuration */
    sampleRate?: SampleRate;
    /** Specific event type to buffer */
    eventType?: SupportedEventType;
    /** Whether to accumulate deltas */
    accumulateDeltas?: boolean;
}

/**
 * Event handler type
 */
export type EventHandler = (event: Event, deltas?: AccumulatedDeltas) => void;
