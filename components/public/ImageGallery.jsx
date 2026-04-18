"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function ImageGallery({ images = [], title }) {
  const list = useMemo(() => {
    if (!images.length) return [{ url: "/window.svg", altText: title, isPrimary: true }];
    return images;
  }, [images, title]);
  const [index, setIndex] = useState(Math.max(list.findIndex((item) => item.isPrimary), 0));
  const current = list[index];

  return (
    <div className="gallery-shell">
      <div className="gallery-main">
        <Image
          src={current.url || "/window.svg"}
          alt={current.altText || title}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>
      {list.length > 1 ? (
        <div className="gallery-thumbs">
          {list.map((item, itemIndex) => (
            <button
              type="button"
              key={`${item.url}-${itemIndex}`}
              className={itemIndex === index ? "active" : ""}
              onClick={() => setIndex(itemIndex)}
            >
              <Image
                src={item.url || "/window.svg"}
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
