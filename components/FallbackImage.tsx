// components/FallbackImage.tsx
'use client';

import React, { useState } from 'react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const FallbackImage: React.FC<FallbackImageProps> = ({ 
  src, 
  fallbackSrc = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop',
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};

export default FallbackImage;