import { useEffect, useRef, useState } from 'react';
import { TileGrid, getTileCoordinates } from '../utils/tileCalculations';
import { LoadedImage } from '../utils/imageProcessing';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface GridPreviewProps {
  image: LoadedImage;
  grid: TileGrid;
}

export function GridPreview({ image, grid }: GridPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 60;

    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const initialScale = Math.min(scaleX, scaleY, 1);

    setZoom(initialScale);
    setMaxZoom(Math.max(2, 1 / initialScale));

    const displayWidth = image.width * initialScale;
    const displayHeight = image.height * initialScale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(image.image, 0, 0, displayWidth, displayHeight);

    ctx.strokeStyle = '#c05621';
    ctx.lineWidth = 2;

    const scaleRatio = displayWidth / image.width;

    for (let i = 0; i < grid.totalTiles; i++) {
      const coords = getTileCoordinates(i, grid);
      const x = coords.x * scaleRatio;
      const y = coords.y * scaleRatio;
      const w = coords.width * scaleRatio;
      const h = coords.height * scaleRatio;

      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = 'rgba(192, 86, 33, 0.08)';
      ctx.fillRect(x, y, w, h);

      const col = (i % grid.columns) + 1;
      const row = Math.floor(i / grid.columns) + 1;

      ctx.fillStyle = '#2d3748';
      ctx.font = `${Math.max(12, 10 * scaleRatio)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${row},${col}`, x + w / 2, y + h / 2);
    }
  }, [image, grid]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  return (
    <div ref={containerRef} className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-main/30 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide">Grid Preview</h2>
          <p className="text-sm text-folk-text/70 mt-1">
            {grid.columns} × {grid.rows} tiles ({grid.totalTiles} total)
          </p>
          <p className="text-xs text-folk-text/60 mt-1">
            Each tile: {grid.tileWidthPx} × {grid.tileHeightPx} pixels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-folk-text bg-folk-accent1/20 rounded-md hover:bg-folk-accent1/30 transition-colors border border-folk-accent1/30"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-body text-folk-text min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-folk-text bg-folk-accent1/20 rounded-md hover:bg-folk-accent1/30 transition-colors border border-folk-accent1/30"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-folk-bg/50 rounded-md p-4 border border-folk-accent1/20">
        <div className="flex items-center justify-center min-h-full">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}
