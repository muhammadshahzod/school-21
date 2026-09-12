"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

export default function PostImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className="image-fallback">
        <ImageOff size={26} />
        <span>Rasmni yuklab bo‘lmadi</span>
      </div>
    );
  // User-entered HTTP(S) image URLs are displayed directly for this frontend demo.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="post-image"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
    />
  );
}
