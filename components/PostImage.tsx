"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/useLang";

export default function PostImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const { t } = useLang();
  if (failed)
    return (
      <div className="image-fallback">
        <ImageOff size={26} />
        <span>{t("postCard.image_load_failed")}</span>
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
