import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw',
  srcSet,
  fallbackSrc,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  const imageProps = {
    src: imageSrc,
    alt,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
    role: alt ? 'img' : 'presentation',
    'aria-hidden': !alt ? 'true' : undefined,
    ...(width && { width }),
    ...(height && { height }),
    ...(srcSet && { srcSet }),
    ...(sizes && { sizes })
  };

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className="text-gray-500 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <>
          <Skeleton
            className={`absolute inset-0 ${className}`}
            style={{ width, height }}
          />
          <span className="sr-only" aria-live="polite">
            Loading image: {alt}
          </span>
        </>
      )}
      <img {...imageProps} />
      {!isLoading && !hasError && (
        <span className="sr-only" aria-live="polite">
          Image loaded: {alt}
        </span>
      )}
    </div>
  );
};

// Helper function to generate responsive image URLs (for Unsplash)
const generateResponsiveSrc = (baseUrl: string, width: number, quality: number = 80) => {
  if (baseUrl.includes('unsplash.com')) {
    return `${baseUrl}&w=${width}&q=${quality}`;
  }
  return baseUrl;
};

// Predefined image configurations for common use cases
export const HeroImage: React.FC<Omit<OptimizedImageProps, 'sizes' | 'srcSet'> & { src: string }> = ({ src, ...props }) => {
  const srcSet = [
    `${generateResponsiveSrc(src, 640)} 640w`,
    `${generateResponsiveSrc(src, 1024)} 1024w`,
    `${generateResponsiveSrc(src, 1920)} 1920w`,
    `${generateResponsiveSrc(src, 2560)} 2560w`
  ].join(', ');

  return (
    <OptimizedImage
      {...props}
      src={generateResponsiveSrc(src, 1920)}
      srcSet={srcSet}
      sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, (max-width: 1920px) 1920px, 2560px"
      priority={true}
    />
  );
};

export const ContentImage: React.FC<Omit<OptimizedImageProps, 'sizes' | 'srcSet'> & { src: string }> = ({ src, ...props }) => {
  const srcSet = [
    `${generateResponsiveSrc(src, 400)} 400w`,
    `${generateResponsiveSrc(src, 600)} 600w`,
    `${generateResponsiveSrc(src, 800)} 800w`,
    `${generateResponsiveSrc(src, 1200)} 1200w`
  ].join(', ');

  return (
    <OptimizedImage
      {...props}
      src={generateResponsiveSrc(src, 800)}
      srcSet={srcSet}
      sizes="(max-width: 640px) 400px, (max-width: 1024px) 600px, (max-width: 1200px) 800px, 1200px"
      priority={false}
    />
  );
};

export default OptimizedImage;
