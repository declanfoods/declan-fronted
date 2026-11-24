import { useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function MobileProductGallery({ name, images }: { name: string; images: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  return (
    <section aria-label="Product photos" className="px-4 pt-4 sm:px-6 lg:hidden">
      {images.length === 0 ? (
        <div className="flex aspect-[4/3] items-center justify-center gap-2 rounded-3xl bg-[#f3f5eb] text-sm text-[#42594a]">
          <ImageOff size={20} aria-hidden /> No product photo
        </div>
      ) : (
        <div
          ref={track}
          onScroll={(event) => {
            const { scrollLeft, clientWidth } = event.currentTarget;
            if (clientWidth) setActive(Math.max(0, Math.min(images.length - 1, Math.round(scrollLeft / clientWidth))));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-3xl bg-[#f3f5eb] scrollbar-hide motion-safe:scroll-smooth"
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="aspect-[4/3] w-full shrink-0 snap-start p-4">
              <img
                src={image}
                alt={images.length > 1 ? `${name}, photo ${index + 1}` : name}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="mt-2 flex flex-wrap items-center justify-center" aria-label="Choose a photo">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              aria-pressed={active === index}
              onClick={() => {
                const gallery = track.current;
                if (gallery) gallery.scrollTo({ left: gallery.clientWidth * index });
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-primary"
            >
              <span className={`h-2 rounded-full ${active === index ? 'w-5 bg-[#245b38]' : 'w-2 bg-[#9fac96]'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
