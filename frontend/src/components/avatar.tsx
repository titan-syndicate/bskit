interface AvatarProps {
  src?: string;
  initials?: string;
  className?: string;
  square?: boolean;
  alt?: string;
}

export function Avatar({ src, initials, className = '', square = false, alt = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`inline-block size-10 rounded-full object-cover ${square ? 'rounded-lg' : ''} ${className}`}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`inline-flex size-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 ${square ? 'rounded-lg' : ''
          } ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`inline-block size-10 rounded-full bg-gray-100 ${square ? 'rounded-lg' : ''
        } ${className}`}
    />
  );
}