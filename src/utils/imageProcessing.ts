import { TileGrid, getTileCoordinates } from './tileCalculations';

export interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
  format: string;
}

export function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

function createCanvas(width: number, height: number): CanvasLike {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function get2DContext(canvas: CanvasLike): Canvas2DContext {
  const context = canvas.getContext('2d', { alpha: true }) as Canvas2DContext | null;
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  context.imageSmoothingEnabled = false;
  context.imageSmoothingQuality = 'high';

  return context;
}

function drawTileOnContext(
  ctx: Canvas2DContext,
  sourceImage: HTMLImageElement,
  grid: TileGrid,
  tileIndex: number,
  backgroundColor: string
) {
  const coords = getTileCoordinates(tileIndex, grid);

  ctx.clearRect(0, 0, grid.tileWidthPx, grid.tileHeightPx);

  if (grid.paddedWidth || grid.paddedHeight) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, grid.tileWidthPx, grid.tileHeightPx);
  }

  ctx.drawImage(
    sourceImage,
    coords.x,
    coords.y,
    coords.width,
    coords.height,
    0,
    0,
    coords.width,
    coords.height
  );
}

async function canvasToPngBlob(canvas: CanvasLike): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
  }

  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create tile blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function extractTile(
  sourceImage: HTMLImageElement,
  tileIndex: number,
  grid: TileGrid,
  backgroundColor: string = DEFAULT_BACKGROUND_COLOR
): Promise<Blob> {
  const canvas = createCanvas(grid.tileWidthPx, grid.tileHeightPx);
  const ctx = get2DContext(canvas);

  drawTileOnContext(ctx, sourceImage, grid, tileIndex, backgroundColor);

  return canvasToPngBlob(canvas);
}

export async function extractAllTiles(
  sourceImage: HTMLImageElement,
  grid: TileGrid,
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const tiles: Blob[] = new Array(grid.totalTiles);
  const canvas = createCanvas(grid.tileWidthPx, grid.tileHeightPx);
  const ctx = get2DContext(canvas);
  const tilePixels = Math.max(grid.tileWidthPx * grid.tileHeightPx, 1);
  const targetPixelsPerBatch = 1_000_000;
  const batchSize = Math.max(1, Math.floor(targetPixelsPerBatch / tilePixels)) || 1;

  let processed = 0;

  for (let start = 0; start < grid.totalTiles; start += batchSize) {
    const end = Math.min(start + batchSize, grid.totalTiles);

    for (let tileIndex = start; tileIndex < end; tileIndex++) {
      drawTileOnContext(ctx, sourceImage, grid, tileIndex, DEFAULT_BACKGROUND_COLOR);
      tiles[tileIndex] = await canvasToPngBlob(canvas);
    }

    processed = end;

    if (onProgress) {
      onProgress(processed, grid.totalTiles);
    }

    if (end < grid.totalTiles) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return tiles;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getTileFilename(
  baseFilename: string,
  tileIndex: number,
  grid: TileGrid
): string {
  const col = (tileIndex % grid.columns) + 1;
  const row = Math.floor(tileIndex / grid.columns) + 1;

  const baseName = baseFilename.replace(/\.[^/.]+$/, '');

  const colStr = String(col).padStart(2, '0');
  const rowStr = String(row).padStart(2, '0');

  return `${baseName}_tile_r${rowStr}_c${colStr}.png`;
}
