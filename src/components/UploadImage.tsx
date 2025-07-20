import { useState, useRef } from 'react';
import { Upload, Camera, Image, X, Check, AlertCircle } from 'lucide-react';

interface UploadImageProps {
  onImageUpload: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadImage = ({ onImageUpload, isAnalyzing }: UploadImageProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona solo archivos de imagen');
      return;
    }

    // Validate file size (10MB limit to match backend)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo debe ser menor a 10MB');
      return;
    }

    // Validate supported formats
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      setError('Formato no soportado. Usa JPG, PNG o WEBP');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="card">
        <div className="card-header text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-h1 mb-2 text-gray-800">Identificar Plato Cocido</h1>
          <p className="text-body text-gray-600">
            Sube una foto de tu plato cocido para obtener información detallada sobre la receta
          </p>
        </div>

        <div className="card-body">
          {!selectedFile ? (
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${dragActive 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-300 hover:bg-primary-25'
                }
                ${error ? 'border-red-300 bg-red-50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                className="hidden"
                title="Seleccionar archivo de imagen"
              />

              <div className="mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-h3 mb-2 text-gray-800">
                  Arrastra tu imagen aquí o haz clic para subir
                </h3>
                <p className="text-body-sm text-gray-500 mb-4">
                  Formatos soportados: JPG, PNG, WEBP (máx. 10MB)
                </p>
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-body-sm">{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={openFileDialog}
                  className="btn btn-primary"
                  disabled={isAnalyzing}
                >
                  <Image className="w-5 h-5" />
                  Seleccionar Archivo
                </button>
                <button
                  onClick={openFileDialog}
                  className="btn btn-outline"
                  disabled={isAnalyzing}
                >
                  <Camera className="w-5 h-5" />
                  Tomar Foto
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Preview Section */}
              <div className="mb-6">
                <div className="relative bg-gray-50 rounded-xl p-4 mb-4">
                  <button
                    onClick={clearSelection}
                    className="absolute top-2 right-2 btn btn-icon bg-red-500 hover:bg-red-600 text-white w-8 h-8"
                    title="Eliminar imagen seleccionada"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img
                    src={previewUrl || ''}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-green-800">
                      Imagen seleccionada: {selectedFile.name}
                    </p>
                    <p className="text-caption text-green-600">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  className="btn btn-primary btn-lg flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner" />
                      Analizando plato...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Identificar Plato
                    </>
                  )}
                </button>
                <button
                  onClick={clearSelection}
                  disabled={isAnalyzing}
                  className="btn btn-outline"
                >
                  Cambiar Imagen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 animate-fade-in animate-delay-200ms">
        <div className="card">
          <div className="card-body">
            <h3 className="text-h3 mb-4 text-gray-800">💡 Consejos para mejores resultados</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-sm">1</span>
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-800">Buena iluminación</p>
                  <p className="text-caption text-gray-600">Asegúrate de que el plato esté bien iluminado</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-sm">2</span>
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-800">Plato completo</p>
                  <p className="text-caption text-gray-600">Incluye todo el plato en la imagen para mejor identificación</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-sm">3</span>
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-800">Ángulo frontal</p>
                  <p className="text-caption text-gray-600">Toma la foto desde arriba o de frente al plato</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 text-sm">4</span>
                </div>
                <div>
                  <p className="text-body-sm font-medium text-gray-800">Imagen nítida</p>
                  <p className="text-caption text-gray-600">Evita imágenes borrosas para mejor reconocimiento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;