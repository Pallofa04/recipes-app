import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';

interface UploadImageProps {
  onImageUpload: (file: File) => Promise<void>;
  isAnalyzing: boolean;
}

const UploadImage: React.FC<UploadImageProps> = ({ onImageUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File): void => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP)');
      return;
    }

    // Validate file size (10MB limit to match backend)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (): void => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
  };

  const handleClear = (): void => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Food Photo</h2>
        <p className="text-gray-600 text-sm">
          Take a photo of your ingredients or a cooked dish and let AI identify them
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isAnalyzing}
        aria-label="Upload food photo"
      />

        {preview ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={handleClear}
                disabled={isAnalyzing}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                aria-label="Clear image"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Identify Dish & Ingredients'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <Camera size={48} />
            </div>
            <p className="text-gray-600 mb-2">
              {isAnalyzing ? 'Processing...' : 'Drag and drop an image here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;