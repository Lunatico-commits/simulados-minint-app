import React, { useEffect, useRef } from "react";

export default function NativeAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SCRIPT_SRC = "https://pl30521691.effectivecpmnetwork.com/15d049f8a421c47f754f588e7b730f52/invoke.js";

    // Avoid injecting duplicate script if already present in this container
    const existingScript = containerRef.current.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existingScript) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;
    script.onerror = (e) => {
      // Prevent third-party cross-origin script error propagation
      if (typeof e === 'object' && e && 'preventDefault' in e) {
        (e as Event).preventDefault();
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      try {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch {
        // Cleanup fallback
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 mx-auto text-center overflow-hidden min-h-[80px]">
      <div
        ref={containerRef}
        id="container-15d049f8a421c47f754f588e7b730f52"
        className="w-full flex items-center justify-center"
      />
    </div>
  );
}
