import React, { useState } from 'react';

interface FallbackImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  // 只要 src 为空、包含瞎编的假域名、或者加载失败，立即触发高级渐变色块
  if (!src || hasError || src.includes('example.com') || src.includes('XXXXXX')) {
    const firstLetter = alt ? alt.charAt(0) : '📍';
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold text-4xl shadow-inner ${className}`} style={{ minHeight: '150px' }}>
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
    />
  );
};
