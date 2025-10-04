import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ImageGrid } from './components/ImageGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PaymentModal } from './components/PaymentModal';
import { generatePortraits, isApiKeyConfigured } from './services/geminiService';
import type { GeneratedImage } from './types';

function ApiKeyConfigurationMessage() {
  return (
    <div className="bg-red-50 text-red-900 p-8 rounded-lg max-w-4xl mx-auto my-12 font-mono text-left">
      <h2 className="text-2xl font-bold mb-4">Configuration Needed</h2>
      <p>
        The Google Gemini API key is missing.
      </p>
      <p className="mt-2">
        To use this application, you need to configure your API key as an environment variable named <code className="bg-red-200 px-1 rounded">API_KEY</code>.
      </p>
       <p className="mt-4 text-sm">Please refer to the setup instructions in the README file for more details.</p>
    </div>
  );
}


function App() {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | undefined>(undefined);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const keyIsConfigured = isApiKeyConfigured();

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImageFile(file);
    if (uploadedImagePreview) {
      URL.revokeObjectURL(uploadedImagePreview);
    }
    setUploadedImagePreview(URL.createObjectURL(file));
    setGeneratedImages([]); // Clear previous results
    setSelectedImages([]);
  }, [uploadedImagePreview]);

  const handleGenerate = useCallback(async () => {
    if (!uploadedImageFile || !keyIsConfigured) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedImages([]);

    try {
      await generatePortraits(uploadedImageFile, (newImage) => {
        setGeneratedImages(prevImages => [...prevImages, newImage]);
      });
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating portraits. This might be due to API rate limits or a network issue. Please check the console and try again later.');
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImageFile, keyIsConfigured]);

  const handleImageSelect = useCallback((id: string) => {
    setSelectedImages(prevSelected => {
      const isSelected = prevSelected.includes(id);
      const selectedImageInfo = generatedImages.find(img => img.id === id);
      const isPremium = selectedImageInfo?.isPremium ?? false;
      const freeSlotsUsed = prevSelected.map(sid => generatedImages.find(img => img.id === sid)).filter(img => img && !img.isPremium).length;
      
      if (isSelected) {
        return prevSelected.filter(imageId => imageId !== id);
      }
      
      if (!isPremium && freeSlotsUsed >= 3 && !isSubscribed) {
        alert("You can only select up to 3 free images. Upgrade to Pro for unlimited selections.");
        return prevSelected;
      }
      
      return [...prevSelected, id];
    });
  }, [generatedImages, isSubscribed]);

  const handleDownload = useCallback(() => {
    const selectedArePremium = generatedImages
      .filter(img => selectedImages.includes(img.id))
      .some(img => img.isPremium);

    if (selectedArePremium && !isSubscribed) {
      setIsPaymentModalOpen(true);
      return;
    }
    
    if (selectedImages.length > 0) {
      selectedImages.forEach((id, index) => {
        const image = generatedImages.find(img => img.id === id);
        if (image) {
          // Use a timeout to prevent the browser from blocking multiple immediate downloads
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = image.src;
            const sanitizedName = image.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            link.download = `portrait-banana-${sanitizedName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 300); // Stagger downloads
        }
      });
    }
  }, [selectedImages, generatedImages, isSubscribed]);

  const handleUpgrade = useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const handleSubscriptionSuccess = useCallback(() => {
    setIsSubscribed(true);
    setIsPaymentModalOpen(false);
    alert("Success! Pro account activated for this session.");
  }, []);


  return (
    <div className="bg-white text-gray-900 dark:bg-black dark:text-gray-100 min-h-screen font-sans">
      <Header onUpgrade={handleUpgrade} isSubscribed={isSubscribed} />
      <main className="container mx-auto px-4">
        <Hero 
          onImageUpload={handleImageUpload}
          onGenerate={handleGenerate}
          uploadedImagePreview={uploadedImagePreview}
          isGenerating={isGenerating}
          isApiKeyConfigured={keyIsConfigured}
        />

        {!keyIsConfigured && <ApiKeyConfigurationMessage />}

        {isGenerating && <LoadingSpinner />}
        
        {generatedImages.length > 0 && (
          <ImageGrid 
            images={generatedImages}
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
            onDownload={handleDownload}
            isSubscribed={isSubscribed}
          />
        )}

        {error && !isGenerating && <p className="text-center text-red-500 my-8">{error}</p>}

      </main>
      
      {isPaymentModalOpen && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onSubscriptionSuccess={handleSubscriptionSuccess} 
        />
      )}
    </div>
  );
}

export default App;