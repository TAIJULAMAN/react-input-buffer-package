import '@testing-library/jest-dom';

// Mock performance.now if not available
if (typeof performance === 'undefined') {
    global.performance = {
        now: () => Date.now(),
    } as any;
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as any;
};

global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
};

// Mock scheduler.yield (2026 feature)
(global as any).scheduler = {
    yield: async () => Promise.resolve(),
};
