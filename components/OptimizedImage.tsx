import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes = "(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw", // adjust based on your layout
  quality = 75,
  priority = false,
}: OptimizedImageProps) {
  const [isError, setIsError] = useState(false);

  if (isError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { width: "100%", height: "100%" } : { width, height }}
      >
        <span className="text-gray-400 text-sm">📷</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      className={className}
      sizes={sizes}
      quality={quality}
      priority={priority}
      onError={() => setIsError(true)}
    />
  );
}