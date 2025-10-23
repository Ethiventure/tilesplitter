export type MeasurementUnit = 'pixels' | 'mm' | 'inches' | 'count';
export type RemainderStrategy = 'crop' | 'pad';

export interface TileConfig {
  unit: MeasurementUnit;
  value: number;
  dpi?: number;
  remainderStrategy: RemainderStrategy;
}

export interface TileGrid {
  tileWidthPx: number;
  tileHeightPx: number;
  columns: number;
  rows: number;
  totalTiles: number;
  sourceWidth: number;
  sourceHeight: number;
  paddedWidth?: number;
  paddedHeight?: number;
}

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function inchesToPixels(inches: number, dpi: number): number {
  return Math.round(inches * dpi);
}

export function pixelsToMm(pixels: number, dpi: number): number {
  return (pixels * 25.4) / dpi;
}

export function pixelsToInches(pixels: number, dpi: number): number {
  return pixels / dpi;
}

export function calculateTileGrid(
  imageWidth: number,
  imageHeight: number,
  config: TileConfig
): TileGrid {
  let tileWidthPx: number;
  let tileHeightPx: number;
  let columns: number;
  let rows: number;

  switch (config.unit) {
    case 'pixels':
      tileWidthPx = config.value;
      tileHeightPx = config.value;
      columns = Math.floor(imageWidth / tileWidthPx);
      rows = Math.floor(imageHeight / tileHeightPx);
      break;

    case 'mm':
      if (!config.dpi) throw new Error('DPI required for mm measurements');
      tileWidthPx = mmToPixels(config.value, config.dpi);
      tileHeightPx = tileWidthPx;
      columns = Math.floor(imageWidth / tileWidthPx);
      rows = Math.floor(imageHeight / tileHeightPx);
      break;

    case 'inches':
      if (!config.dpi) throw new Error('DPI required for inch measurements');
      tileWidthPx = inchesToPixels(config.value, config.dpi);
      tileHeightPx = tileWidthPx;
      columns = Math.floor(imageWidth / tileWidthPx);
      rows = Math.floor(imageHeight / tileHeightPx);
      break;

    case 'count':
      columns = Math.floor(config.value);
      rows = Math.floor(config.value);
      tileWidthPx = Math.floor(imageWidth / columns);
      tileHeightPx = Math.floor(imageHeight / rows);
      break;

    default:
      throw new Error('Invalid measurement unit');
  }

  if (columns === 0 || rows === 0) {
    throw new Error('Tile size too large for image dimensions');
  }

  const result: TileGrid = {
    tileWidthPx,
    tileHeightPx,
    columns,
    rows,
    totalTiles: columns * rows,
    sourceWidth: imageWidth,
    sourceHeight: imageHeight,
  };

  if (config.remainderStrategy === 'pad') {
    const remainderWidth = imageWidth - (columns * tileWidthPx);
    const remainderHeight = imageHeight - (rows * tileHeightPx);

    if (remainderWidth > 0) {
      result.columns = columns + 1;
      result.paddedWidth = columns * tileWidthPx + tileWidthPx;
    }

    if (remainderHeight > 0) {
      result.rows = rows + 1;
      result.paddedHeight = rows * tileHeightPx + tileHeightPx;
    }

    result.totalTiles = result.columns * result.rows;
  }

  return result;
}

export function getTileCoordinates(
  tileIndex: number,
  grid: TileGrid
): { x: number; y: number; width: number; height: number } {
  const col = tileIndex % grid.columns;
  const row = Math.floor(tileIndex / grid.columns);

  const x = col * grid.tileWidthPx;
  const y = row * grid.tileHeightPx;

  let width = grid.tileWidthPx;
  let height = grid.tileHeightPx;

  if (grid.paddedWidth && col === grid.columns - 1) {
    width = Math.min(grid.tileWidthPx, grid.sourceWidth - x);
  }

  if (grid.paddedHeight && row === grid.rows - 1) {
    height = Math.min(grid.tileHeightPx, grid.sourceHeight - y);
  }

  return { x, y, width, height };
}

export function validateTileConfig(config: TileConfig): string | null {
  if (config.value <= 0) {
    return 'Value must be greater than 0';
  }

  if ((config.unit === 'mm' || config.unit === 'inches') && !config.dpi) {
    return 'DPI is required for physical measurements';
  }

  if (config.dpi && config.dpi < 1) {
    return 'DPI must be at least 1';
  }

  return null;
}
