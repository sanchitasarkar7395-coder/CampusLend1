import { useState } from 'react';
import { Bike, BookOpen, Flame, Shirt } from 'lucide-react';
import { ItemCategory } from '../types';

interface ProductImageProps {
  src: string;
  alt: string;
  category: ItemCategory;
  className?: string;
}

export function ProductImage({ src, alt, category, className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const FallbackIcon =
    category === 'Hostel Appliances'
      ? Flame
      : category === 'Formal & Placement Attire'
        ? Shirt
        : category === 'Academic & Lab Gear'
          ? BookOpen
          : Bike;

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <FallbackIcon className="w-9 h-9 text-slate-400 mb-2" strokeWidth={1.6} />
        <span className="text-xs font-medium text-slate-500 px-4 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover w-full h-full ${className}`}
      loading="lazy"
    />
  );
}
