import { useState, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  RefreshCcw,
} from "lucide-react";

export default function ImageViewer({ src, alt }) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 4)), []);
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(s - 0.25, 0.25)),
    [],
  );
  const rotateL = useCallback(() => setRotate((r) => r - 90), []);
  const rotateR = useCallback(() => setRotate((r) => r + 90), []);
  const reset = useCallback(() => {
    setScale(1);
    setRotate(0);
  }, []);

  const controls = [
    { icon: <ZoomOut size={16} />, action: zoomOut, label: "Zoom out" },
    { icon: <ZoomIn size={16} />, action: zoomIn, label: "Zoom in" },
    { icon: <RotateCcw size={16} />, action: rotateL, label: "Rotate left" },
    { icon: <RotateCw size={16} />, action: rotateR, label: "Rotate right" },
    { icon: <RefreshCcw size={16} />, action: reset, label: "Reset" },
    {
      icon: <Maximize2 size={16} />,
      action: () => setFullscreen(true),
      label: "Fullscreen",
    },
  ];

  return (
    <>
      {/* Viewer */}
      <div className="img-viewer">
        <div className="img-viewer__stage">
          <img
            src={src}
            alt={alt}
            className="img-viewer__img"
            style={{
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              transition: "transform 0.2s ease",
            }}
            draggable={false}
          />
        </div>

        {/* Controls bar */}
        <div className="img-viewer__controls">
          {controls.map(({ icon, action, label }) => (
            <button
              key={label}
              className="img-viewer__ctrl-btn"
              onClick={action}
              title={label}
              aria-label={label}
            >
              {icon}
            </button>
          ))}
          <span className="img-viewer__zoom-label">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="img-viewer__fullscreen"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={src}
            alt={alt}
            style={{ transform: `rotate(${rotate}deg)` }}
            draggable={false}
          />
          <button
            className="img-viewer__fs-close"
            onClick={() => setFullscreen(false)}
            aria-label="Exit fullscreen"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
