import { useState, useMemo } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { TileConfig } from './components/TileConfig';
import { GridPreview } from './components/GridPreview';
import { TileInfo } from './components/TileInfo';
import { ExportPanel } from './components/ExportPanel';
import { LoadedImage } from './utils/imageProcessing';
import { calculateTileGrid, TileGrid, TileConfig as TileConfigType } from './utils/tileCalculations';
import { Scissors } from 'lucide-react';

function App() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [config, setConfig] = useState<TileConfigType>({
    unit: 'mm',
    value: 50,
    dpi: 300,
    remainderStrategy: 'crop',
  });

  const grid: TileGrid | null = useMemo(() => {
    if (!image) return null;

    try {
      return calculateTileGrid(image.width, image.height, config);
    } catch (error) {
      console.error('Grid calculation error:', error);
      return null;
    }
  }, [image, config]);

  const handleImageLoad = (loadedImage: LoadedImage, file: File) => {
    setImage(loadedImage);
    setOriginalFile(file);
  };

  const handleClearImage = () => {
    setImage(null);
    setOriginalFile(null);
  };

  return (
    <div className="min-h-screen bg-folk-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Scissors className="w-10 h-10 text-folk-main" />
            <h1 className="text-5xl font-heading font-bold text-folk-text tracking-wide">Tile Splitter</h1>
          </div>
          <p className="text-lg text-folk-text/80 max-w-2xl mx-auto">
            Split large images into precise square tiles for printing. No scaling, no mystery math.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-0.5 w-16 bg-folk-accent1"></div>
            <div className="h-1 w-1 rounded-full bg-folk-main"></div>
            <div className="h-0.5 w-16 bg-folk-accent1"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 space-y-6">
            <ImageUpload
              onImageLoad={handleImageLoad}
              onClear={handleClearImage}
              currentImage={image || undefined}
            />

            {image && (
              <>
                <TileConfig config={config} onChange={setConfig} />

                {grid && (
                  <>
                    <TileInfo image={image} grid={grid} />
                    <ExportPanel
                      image={image}
                      grid={grid}
                      originalFile={originalFile!}
                    />
                  </>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            {image && grid ? (
              <GridPreview image={image} grid={grid} />
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-accent1/30 p-12 h-full flex items-center justify-center">
                <div className="text-center text-folk-text/40">
                  <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-body">Upload an image to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-main/20 p-6">
          <h2 className="text-base font-heading font-semibold text-folk-main mb-4 tracking-wide">About Precision</h2>
          <div className="text-sm text-folk-text/80 space-y-2">
            <p>
              <strong>No cumulative drift:</strong> Tiles are extracted using exact pixel coordinates.
              The last tile edge aligns perfectly with the source image edge when using strict crop mode.
            </p>
            <p>
              <strong>No silent resampling:</strong> Image data is extracted at native resolution with
              no scaling or interpolation applied during tile extraction.
            </p>
            <p>
              <strong>Remainder handling:</strong> Choose between strict crop (only complete tiles) or
              pad mode (adds white space to create full tiles at edges).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
