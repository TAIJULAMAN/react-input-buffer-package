import { useState, useRef, useEffect } from 'react';
import { InputSanitizer, Metrics } from 'react-input-buffer';
import './App.css';

function App() {
    const [useBuffer, setUseBuffer] = useState(true);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [eventCount, setEventCount] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathRef = useRef<{ x: number; y: number }[]>([]);

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent) => {
        setEventCount((prev) => prev + 1);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setCursorPos({ x, y });
            pathRef.current.push({ x, y });
        }
    };

    // Draw on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw path
        if (pathRef.current.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
            for (let i = 1; i < pathRef.current.length; i++) {
                ctx.lineTo(pathRef.current[i].x, pathRef.current[i].y);
            }
            ctx.stroke();
        }

        // Draw cursor
        ctx.beginPath();
        ctx.arc(cursorPos.x, cursorPos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
    }, [cursorPos]);

    const clearCanvas = () => {
        pathRef.current = [];
        setEventCount(0);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const content = (
        <div className="app">
            <header className="header">
                <h1>🚀 react-input-buffer Demo</h1>
                <p>The FPS-fix for Web Apps</p>
            </header>

            <div className="controls">
                <button
                    className={`toggle-btn ${useBuffer ? 'active' : ''}`}
                    onClick={() => setUseBuffer(!useBuffer)}
                >
                    {useBuffer ? '✅ Buffering ON' : '❌ Buffering OFF'}
                </button>
                <button className="clear-btn" onClick={clearCanvas}>
                    Clear Canvas
                </button>
            </div>

            <div className="metrics-panel">
                <h3>📊 Performance Metrics</h3>
                {metrics ? (
                    <div className="metrics-grid">
                        <div className="metric">
                            <span className="label">Polling Rate:</span>
                            <span className="value">
                                {metrics.pollingRate} ({metrics.detectedHz}Hz)
                            </span>
                        </div>
                        <div className="metric">
                            <span className="label">Raw Events:</span>
                            <span className="value">{metrics.rawEventCount}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Flushed Events:</span>
                            <span className="value">{metrics.flushedEventCount}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Reduction:</span>
                            <span className="value highlight">
                                {metrics.reductionPercentage}%
                            </span>
                        </div>
                        <div className="metric">
                            <span className="label">Current FPS:</span>
                            <span className="value">{metrics.currentFPS}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Avg Processing:</span>
                            <span className="value">
                                {metrics.averageProcessingTime.toFixed(2)}ms
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="no-metrics">Move your mouse to see metrics...</p>
                )}
            </div>

            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onMouseMove={handleMouseMove}
                    className="drawing-canvas"
                />
                <div className="canvas-info">
                    <p>Draw on the canvas with your mouse</p>
                    <p className="event-counter">Events received: {eventCount}</p>
                </div>
            </div>

            <div className="info-panel">
                <h3>ℹ️ How it works</h3>
                <ul>
                    <li>
                        <strong>Buffering ON:</strong> Events are synced to your monitor's
                        refresh rate (~60-144Hz)
                    </li>
                    <li>
                        <strong>Buffering OFF:</strong> All events are processed immediately
                        (can be 8,000Hz!)
                    </li>
                    <li>
                        Try moving your mouse quickly and watch the reduction percentage
                    </li>
                    <li>High-polling mice will show dramatic performance improvements</li>
                </ul>
            </div>
        </div>
    );

    return useBuffer ? (
        <InputSanitizer
            sampleRate="auto"
            priority="user-visible"
            debug={true}
            onMetrics={setMetrics}
        >
            {content}
        </InputSanitizer>
    ) : (
        content
    );
}

export default App;
