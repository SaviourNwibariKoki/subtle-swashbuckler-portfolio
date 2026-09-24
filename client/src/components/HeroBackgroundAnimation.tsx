import { useEffect, useState } from "react";

const ANIMATED_WEBP = "/assets/purple-swashbuckler.webp";
const STATIC_FALLBACK = "/assets/purple-swashbuckler-static.jpg";

export function HeroBackgroundAnimation() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedImageFailed, setAnimatedImageFailed] = useState(false);
  const [staticFallbackFailed, setStaticFallbackFailed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    function handleMotionChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  const useStaticFallback = prefersReducedMotion || animatedImageFailed;

  return (
    <div
      className="hero-animation-layer"
      aria-hidden="true"
      role="presentation"
    >
      {useStaticFallback ? (
        !staticFallbackFailed ? (
          <img
            src={STATIC_FALLBACK}
            width={1376}
            height={768}
            alt=""
            aria-hidden="true"
            className="hero-animation-media static-fallback"
            loading="eager"
            decoding="async"
            onError={() => setStaticFallbackFailed(true)}
          />
        ) : null
      ) : (
        <img
          src={ANIMATED_WEBP}
          width={800}
          height={450}
          alt=""
          aria-hidden="true"
          className="hero-animation-media animated-webp"
          loading="eager"
          decoding="async"
          onError={() => setAnimatedImageFailed(true)}
        />
      )}

      <div className="hero-animation-overlay" aria-hidden="true" />
    </div>
  );
}
