import { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { LoadedImage } from '../utils/imageProcessing';

interface ImageUploadProps {
  onImageLoad: (image: LoadedImage, file: File) => void;
  onClear?: () => void;
  currentImage?: LoadedImage;
  disabled?: boolean;
}

export function ImageUpload({ onImageLoad, onClear, currentImage, disabled }: ImageUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        alert('Please select a PNG, JPG, or SVG image');
        return;
      }

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
          URL.revokeObjectURL(url);
          const loadedImage: LoadedImage = {
            image: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: file.type,
          };
          onImageLoad(loadedImage, file);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          alert('Failed to load image');
        };

        img.src = url;
      } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image');
      }

      e.target.value = '';
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        alert('Please select a PNG, JPG, or SVG image');
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileChange({ target: input } as any);
    },
    [handleFileChange, disabled]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (currentImage) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-folk-accent2/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide">Current Image</h2>
            <p className="text-sm text-folk-text/70 mt-1">
              {currentImage.width} × {currentImage.height} pixels
            </p>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 text-sm font-body font-medium text-folk-main bg-folk-main/10 rounded-md hover:bg-folk-main/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-folk-main/30"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white/60 backdrop-blur-sm rounded-lg shadow-md border-2 border-dashed border-folk-accent1/50 p-8 hover:border-folk-main/50 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="w-12 h-12 text-folk-accent2 mb-4" />
        <h2 className="text-xl font-heading font-semibold text-folk-text tracking-wide mb-2">Upload Image</h2>
        <p className="text-sm text-folk-text/70 mb-4">
          Drop your PNG, JPG, or SVG image here, or click to browse
        </p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-6 py-3 text-sm font-body font-medium text-white bg-folk-main rounded-md hover:bg-folk-main/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            Select Image
          </span>
        </label>
      </div>
    </div>
  );
}
