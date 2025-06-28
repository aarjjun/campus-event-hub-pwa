
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface PosterModalProps {
  posterUrl: string | null;
  onClose: () => void;
}

export const PosterModal = ({ posterUrl, onClose }: PosterModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (posterUrl) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [posterUrl, onClose]);

  if (!posterUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        <img
          src={posterUrl}
          alt="Event poster"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={onClose}
        />
        
        <p className="text-white text-center mt-4 text-sm opacity-75">
          Click anywhere to close
        </p>
      </div>
    </div>
  );
};
