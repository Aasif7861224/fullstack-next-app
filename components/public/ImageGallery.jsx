"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinaryImage";

function GalleryFrame({ list, title }) {
  const [index, setIndex] = useState(Math.max(list.findIndex((item) => item.isPrimary), 0));
  const current = list[index] || list[0];

  return (
    <div className="gallery-shell">
      <div className="gallery-main">
        <div className="gallery-main-visual" key={`${current.url || "fallback"}-${index}`}>
          <Image
            src={getOptimizedCloudinaryUrl(current.url || "/window.svg", "main")}
            alt={current.altText || title}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
          />
        </div>
        {list.length > 1 ? <span className="gallery-count">{index + 1} / {list.length}</span> : null}
      </div>
      {list.length > 1 ? (
        <div className="gallery-thumbs">
          {list.map((item, itemIndex) => (
            <button
              type="button"
              key={`${item.url}-${itemIndex}`}
              className={itemIndex === index ? "active" : ""}
              onClick={() => setIndex(itemIndex)}
              onMouseEnter={() => setIndex(itemIndex)}
              aria-label={`Show image ${itemIndex + 1}`}
              aria-pressed={itemIndex === index}
            >
              <Image
                src={getOptimizedCloudinaryUrl(item.url || "/window.svg", "thumbnail")}
                alt={item.altText || `${title} image ${itemIndex + 1}`}
                fill
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ImageGallery({ images = [], title }) {
  const list = useMemo(() => {
    if (!images.length) return [{ url: "/window.svg", altText: title, isPrimary: true }];
    return images;
  }, [images, title]);
  const galleryKey = list.map((item) => item.url).join("|");

  return <GalleryFrame key={galleryKey} list={list} title={title} />;
}
