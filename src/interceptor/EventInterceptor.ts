import { EventHandler, SupportedEventType } from '../types';

/**
 * Intercepts events at the global level before they reach React components
 */
export class EventInterceptor {
    private activeListeners = new Map<string, EventListener>();
    private shouldBufferCallback: (event: Event) => boolean;
    private eventHandler: EventHandler;

    constructor(
        eventTypes: SupportedEventType[],
        shouldBuffer: (event: Event) => boolean,
        handler: EventHandler
    ) {
        this.shouldBufferCallback = shouldBuffer;
        this.eventHandler = handler;
        this.attach(eventTypes);
    }

    /**
     * Attach event listeners to window
     */
    private attach(eventTypes: SupportedEventType[]): void {
        eventTypes.forEach((type) => {
            const listener = (e: Event) => {
                // Check if this event should be buffered
                if (this.shouldBufferCallback(e)) {
                    // Stop immediate propagation to prevent excess events
                    e.stopImmediatePropagation();
                }

                // Pass to handler for buffering
                this.eventHandler(e);
            };

            window.addEventListener(type, listener, {
                capture: true,
                passive: false,
            });

            this.activeListeners.set(type, listener);
        });
    }

    /**
     * Detach all event listeners
     */
    detach(): void {
        this.activeListeners.forEach((listener, type) => {
            window.removeEventListener(type, listener, { capture: true });
        });
        this.activeListeners.clear();
    }

    /**
     * Update event types being intercepted
     */
    updateEventTypes(eventTypes: SupportedEventType[]): void {
        this.detach();
        this.attach(eventTypes);
    }
}
