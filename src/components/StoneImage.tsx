import { forwardRef, type ImgHTMLAttributes, type SyntheticEvent } from 'react';

const FALLBACK_IMAGE = '/stone-placeholder.webp';

export const StoneImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ onError, ...props }, ref) => {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
    onError?.(event);
  };

  return <img ref={ref} decoding="async" {...props} onError={handleError} />;
});

StoneImage.displayName = 'StoneImage';
