import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { TileGrid } from '../utils/tileCalculations';
import { LoadedImage, extractAllTiles, downloadBlob, getTileFilename } from '../utils/imageProcessing';

interface ExportPanelProps {
  image: LoadedImage;
  grid: TileGrid;
  originalFile: File;
  disabled?: boolean;
}

export function ExportPanel({ image, grid, originalFile, disabled }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleExportPNG = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: grid.totalTiles });

    try {
      const tiles = await extractAllTiles(image.image, grid, (current, total) => {
        setProgress({ current, total });
      });

      for (let i = 0; i < tiles.length; i++) {
        const filename = getTileFilename(originalFile.name, i, grid);
        downloadBlob(tiles[i], filename);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      alert(`Successfully exported ${tiles.length} tiles!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export tiles. Please try again.');
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: grid.totalTiles });

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const tiles = await extractAllTiles(image.image, grid, (current, total) => {
        setProgress({ current, total });
      });

      for (let i = 0; i < tiles.length; i++) {
        const filename = getTileFilename(originalFile.name, i, grid);
        zip.file(filename, tiles[i]);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipFilename = originalFile.name.replace(/\.[^/.]+$/, '') + '_tiles.zip';
      downloadBlob(content, zipFilename);

      alert(`Successfully exported ${tiles.length} tiles as ZIP!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export tiles. Please try again.');
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const estimatedSize = Math.round((grid.tileWidthPx * grid.tileHeightPx * 4 * grid.totalTiles) / 1024 / 1024);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-accent1/30 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide mb-1">Export Tiles</h2>
        <p className="text-sm text-folk-text/70">
          {grid.totalTiles} tiles ready for export
        </p>
        <p className="text-xs text-folk-text/60 mt-1">
          Estimated total size: ~{estimatedSize} MB
        </p>
      </div>

      {isExporting && (
        <div className="mb-4 p-4 bg-folk-accent2/10 border-2 border-folk-accent2/30 rounded-md">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-folk-accent2 animate-spin" />
            <span className="text-sm font-body font-medium text-folk-text">
              Exporting tiles...
            </span>
          </div>
          <div className="w-full bg-folk-accent2/20 rounded-full h-2">
            <div
              className="bg-folk-accent2 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-folk-text/70 mt-2">
            {progress.current} of {progress.total} tiles
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleExportPNG}
          disabled={disabled || isExporting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-body font-medium text-white bg-folk-main rounded-md hover:bg-folk-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export as Individual PNGs
        </button>

        <button
          onClick={handleExportZip}
          disabled={disabled || isExporting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-body font-medium text-folk-text bg-folk-accent1/20 border-2 border-folk-accent1/30 rounded-md hover:bg-folk-accent1/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export as ZIP Archive
        </button>
      </div>

      <div className="mt-4 p-3 bg-folk-bg/50 border border-folk-accent1/20 rounded-md">
        <p className="text-xs text-folk-text/70">
          <strong>File naming:</strong> Tiles are named as{' '}
          <code className="text-xs bg-folk-accent1/20 px-1 py-0.5 rounded">
            filename_tile_rXX_cYY.png
          </code>
          <br />
          where XX is the row number and YY is the column number.
        </p>
      </div>
    </div>
  );
}
