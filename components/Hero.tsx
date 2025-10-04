import React, { useRef } from 'react';

interface HeroProps {
  onImageUpload: (file: File) => void;
  onGenerate: () => void;
  uploadedImagePreview?: string;
  isGenerating: boolean;
  isApiKeyConfigured: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onImageUpload, onGenerate, uploadedImagePreview, isGenerating, isApiKeyConfigured }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="text-center py-12 md:py-24">
      <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tighter leading-tight">
        <span className="text-gray-900 dark:text-gray-100">Create Your</span><br />
        <span className="text-pink-500">AI Portrait</span>
      </h1>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
        Upload a single photo of yourself (or your pet!) and watch it transform into a
        series of professional and artistic portraits.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={handleUploadClick}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {uploadedImagePreview ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          <button
            onClick={onGenerate}
            disabled={!uploadedImagePreview || isGenerating || !isApiKeyConfigured}
            className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Portraits'}
          </button>
        </div>
        {uploadedImagePreview && (
          <div className="mt-6">
            <img src={uploadedImagePreview} alt="Uploaded preview" className="w-32 h-32 object-cover rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </section>
  );
};
