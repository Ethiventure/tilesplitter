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

export async function extractTile(
  sourceImage: HTMLImageElement,
  tileIndex: number,
  grid: TileGrid,
  backgroundColor: string = '#FFFFFF'
): Promise<Blob> {
  const coords = getTileCoordinates(tileIndex, grid);

  const canvas = document.createElement('canvas');
  canvas.width = grid.tileWidthPx;
  canvas.height = grid.tileHeightPx;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Failed to get canvas context');

  if (grid.paddedWidth || grid.paddedHeight) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'high';

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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
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

export async function extractAllTiles(
  sourceImage: HTMLImageElement,
  grid: TileGrid,
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const tiles: Blob[] = [];

  for (let i = 0; i < grid.totalTiles; i++) {
    const tile = await extractTile(sourceImage, i, grid);
    tiles.push(tile);

    if (onProgress) {
      onProgress(i + 1, grid.totalTiles);
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
