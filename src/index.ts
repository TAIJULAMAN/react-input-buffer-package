// Main exports
export { InputSanitizer } from './components/InputSanitizer';
export { useInputBuffer } from './hooks/useInputBuffer';

// Type exports
export type {
    PollingRate,
    Priority,
    SampleRate,
    SupportedEventType,
    AccumulatedDeltas,
    Metrics,
    InputSanitizerProps,
    UseInputBufferOptions,
    EventHandler,
} from './types';

// Core class exports (for advanced usage)
export { PollingRateDetector } from './detection/PollingRateDetector';
export { MetricsCollector } from './metrics/MetricsCollector';
export { SamplingBuffer } from './buffer/SamplingBuffer';
export { EventInterceptor } from './interceptor/EventInterceptor';
export { YieldScheduler } from './scheduler/YieldScheduler';
