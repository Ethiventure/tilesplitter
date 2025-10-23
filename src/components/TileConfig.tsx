import { useState } from 'react';
import { TileConfig as TileConfigType, MeasurementUnit, RemainderStrategy, validateTileConfig } from '../utils/tileCalculations';
import { Settings } from 'lucide-react';

interface TileConfigProps {
  config: TileConfigType;
  onChange: (config: TileConfigType) => void;
  disabled?: boolean;
}

export function TileConfig({ config, onChange, disabled }: TileConfigProps) {
  const [error, setError] = useState<string | null>(null);

  const handleUnitChange = (unit: MeasurementUnit) => {
    const newConfig = { ...config, unit };
    const validationError = validateTileConfig(newConfig);
    setError(validationError);
    onChange(newConfig);
  };

  const handleValueHChange = (value_h: number) => {
    const newConfig = { ...config, value_h };
    const validationError = validateTileConfig(newConfig);
    setError(validationError);
    onChange(newConfig);
  };

  const handleValueVChange = (value_v: number) => {
    const newConfig = { ...config, value_v };
    const validationError = validateTileConfig(newConfig);
    setError(validationError);
    onChange(newConfig);
  };

  const handleValueChange = (value: number) => {
    const newConfig = { ...config, value };
    const validationError = validateTileConfig(newConfig);
    setError(validationError);
    onChange(newConfig);
  };

  const handleDpiChange = (dpi: number) => {
    const newConfig = { ...config, dpi };
    const validationError = validateTileConfig(newConfig);
    setError(validationError);
    onChange(newConfig);
  };

  const handleStrategyChange = (remainderStrategy: RemainderStrategy) => {
    onChange({ ...config, remainderStrategy });
  };

  const requiresDpi = config.unit === 'mm' || config.unit === 'inches';

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-main/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-folk-main" />
        <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide">Tile Configuration</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-body font-medium text-folk-text mb-2">
            Measurement Unit
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleUnitChange('pixels')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.unit === 'pixels'
                  ? 'bg-folk-main text-white border-folk-main shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent1'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Pixels
            </button>
            <button
              onClick={() => handleUnitChange('mm')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.unit === 'mm'
                  ? 'bg-folk-main text-white border-folk-main shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent1'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Millimeters
            </button>
            <button
              onClick={() => handleUnitChange('inches')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.unit === 'inches'
                  ? 'bg-folk-main text-white border-folk-main shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent1'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Inches
            </button>
            <button
              onClick={() => handleUnitChange('count')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.unit === 'count'
                  ? 'bg-folk-main text-white border-folk-main shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent1'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Count
            </button>
            <button
              onClick={() => handleUnitChange('grid')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.unit === 'grid'
                  ? 'bg-folk-main text-white border-folk-main shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent1'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Grid
            </button>
          </div>
        </div>

        {config.unit === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="horizontal_input" className="block text-sm font-body font-medium text-folk-text mb-2">
                Horizontal
              </label>
              <input
                id="horizontal_input"
                type="number"
                value={config.value_h || ''}
                onChange={(e) => handleValueHChange(Number(e.target.value))}
                disabled={disabled}
                min="1"
                step="1"
                className="w-full px-3 py-2 border-2 border-folk-accent1/30 rounded-md focus:ring-2 focus:ring-folk-main focus:border-folk-main disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-folk-text"
              />
            </div>
            <div>
              <label htmlFor="vertical_input" className="block text-sm font-body font-medium text-folk-text mb-2">
                Vertical
              </label>
              <input
                id="vertical_input"
                type="number"
                value={config.value_v || ''}
                onChange={(e) => handleValueVChange(Number(e.target.value))}
                disabled={disabled}
                min="1"
                step="1"
                className="w-full px-3 py-2 border-2 border-folk-accent1/30 rounded-md focus:ring-2 focus:ring-folk-main focus:border-folk-main disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-folk-text"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-body font-medium text-folk-text mb-2">
              {config.unit === 'count' ? 'Number of Squares' : 'Square Size'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={config.value}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  handleValueChange(0);
                } else {
                  const num = Number(val);
                  if (!isNaN(num) && num >= 0) {
                    handleValueChange(num);
                  }
                }
              }}
              disabled={disabled}
              className="w-full px-3 py-2 border-2 border-folk-accent1/30 rounded-md focus:ring-2 focus:ring-folk-main focus:border-folk-main disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-folk-text"
            />
            <p className="text-xs text-folk-text/60 mt-1">
              {config.unit === 'count'
                ? 'Number of squares across and down'
                : `Size of each square tile in ${config.unit}`}
            </p>
          </div>
        )}

        {requiresDpi && (
          <div>
            <label className="block text-sm font-body font-medium text-folk-text mb-2">
              DPI (Dots Per Inch)
            </label>
            <input
              type="number"
              value={config.dpi || 300}
              onChange={(e) => handleDpiChange(Number(e.target.value))}
              disabled={disabled}
              min="1"
              step="1"
              className="w-full px-3 py-2 border-2 border-folk-accent1/30 rounded-md focus:ring-2 focus:ring-folk-main focus:border-folk-main disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 text-folk-text"
            />
            <p className="text-xs text-folk-text/60 mt-1">
              Required for physical measurements (common: 300 for print)
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-body font-medium text-folk-text mb-2">
            Remainder Handling
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStrategyChange('crop')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.remainderStrategy === 'crop'
                  ? 'bg-folk-accent2 text-white border-folk-accent2 shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent2'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Strict Crop
            </button>
            <button
              onClick={() => handleStrategyChange('pad')}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-body font-medium rounded-md transition-colors border ${
                config.remainderStrategy === 'pad'
                  ? 'bg-folk-accent2 text-white border-folk-accent2 shadow-sm'
                  : 'bg-folk-bg text-folk-text border-folk-accent1/30 hover:border-folk-accent2'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Pad to Fit
            </button>
          </div>
          <p className="text-xs text-folk-text/60 mt-2">
            {config.remainderStrategy === 'crop'
              ? 'Only export complete tiles. Edges may be cropped.'
              : 'Add partial tiles with white padding to cover entire image.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-folk-main/10 border-2 border-folk-main/30 rounded-md">
            <p className="text-sm text-folk-main">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
