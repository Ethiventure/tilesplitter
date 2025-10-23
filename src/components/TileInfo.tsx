import { TileGrid } from '../utils/tileCalculations';
import { LoadedImage } from '../utils/imageProcessing';
import { Info } from 'lucide-react';

interface TileInfoProps {
  image: LoadedImage;
  grid: TileGrid;
}

export function TileInfo({ image, grid }: TileInfoProps) {
  const hasRemainder =
    image.width % grid.tileWidthPx !== 0 || image.height % grid.tileHeightPx !== 0;

  const remainderWidth = image.width - grid.columns * grid.tileWidthPx;
  const remainderHeight = image.height - grid.rows * grid.tileHeightPx;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-accent2/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-folk-accent2" />
        <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide">Precision Details</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-body font-medium text-folk-text mb-2">Source Image</h3>
          <div className="text-sm text-folk-text/70 space-y-1">
            <p>
              Dimensions: <span className="font-mono">{image.width} × {image.height} px</span>
            </p>
            <p>
              Format: <span className="font-mono">{image.format}</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-body font-medium text-folk-text mb-2">Tile Grid</h3>
          <div className="text-sm text-folk-text/70 space-y-1">
            <p>
              Grid: <span className="font-mono">{grid.columns} × {grid.rows}</span>
            </p>
            <p>
              Tile size: <span className="font-mono">{grid.tileWidthPx} × {grid.tileHeightPx} px</span>
            </p>
            <p>
              Total tiles: <span className="font-mono">{grid.totalTiles}</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-body font-medium text-folk-text mb-2">Coverage</h3>
          <div className="text-sm text-folk-text/70 space-y-1">
            <p>
              Width covered:{' '}
              <span className="font-mono">{grid.columns * grid.tileWidthPx} px</span>
              {remainderWidth > 0 && (
                <span className="text-folk-accent1 ml-1">
                  ({remainderWidth} px remainder)
                </span>
              )}
            </p>
            <p>
              Height covered:{' '}
              <span className="font-mono">{grid.rows * grid.tileHeightPx} px</span>
              {remainderHeight > 0 && (
                <span className="text-folk-accent1 ml-1">
                  ({remainderHeight} px remainder)
                </span>
              )}
            </p>
          </div>
        </div>

        {hasRemainder && (
          <div className="p-3 bg-folk-accent1/10 border-2 border-folk-accent1/30 rounded-md">
            <p className="text-sm text-folk-text">
              <strong>Note:</strong> Image dimensions do not divide evenly. Remainder pixels will be
              {grid.paddedWidth || grid.paddedHeight ? ' padded with white space' : ' cropped'}.
            </p>
          </div>
        )}

        {!hasRemainder && (
          <div className="p-3 bg-folk-accent2/10 border-2 border-folk-accent2/30 rounded-md">
            <p className="text-sm text-folk-text">
              <strong>Perfect fit:</strong> Image dimensions divide evenly into the tile grid with
              no remainders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
