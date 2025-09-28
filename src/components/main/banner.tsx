import React, { type FC } from "react";

type ScrollingBannerProps = {
  /** Array of paragraphs or lines to show inside the banner (they will wrap). */
  messages: string[];
  /** Animation duration in seconds (lower = faster). */
  speed?: number; // seconds
  /** DaisyUI / Tailwind background class (eg. "bg-base-200"). */
  bgClass?: string;
  /** Optional extra tailwind classes for the text container. */
  className?: string;
};

/**
 * ScrollingBanner
 * - Uses a duplicated track technique to create an infinite horizontal scroll
 * - Mobile-friendly with proper responsive design
 * - Built with Tailwind / DaisyUI-friendly classes
 */
const Banner: FC<ScrollingBannerProps> = ({
  messages,
  speed = 18,
  bgClass = "bg-base-200",
  className = "text-sm md:text-base",
}) => {
  // Create a single line of text with separators
  const singleLine = messages.join(" • ");

  const content = (
    <div className={`flex items-center whitespace-nowrap ${className}`}>
      <span className="px-4">{singleLine}</span>
    </div>
  );

  // animation duration depends on speed prop
  const style: React.CSSProperties = {
    animationDuration: `${speed}s`,
  };
  // a prop is url is passed takes them to the url
  return (
    <div
      className={`relative w-full overflow-hidden ${bgClass} border-0 md:border border-base-300 rounded-none`}
    >
      {/* Gradient overlays - responsive sizing */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-[var(--tw-bg-opacity,theme(colors.base-200))] to-transparent z-10" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[var(--tw-bg-opacity,theme(colors.base-200))] to-transparent z-10" />

      <div
        className="marquee-wrap relative w-full"
        aria-hidden={false}
        role="region"
        aria-label="Scrolling announcements"
      >
        <div className="marquee-track-wrapper" style={style}>
          <div className="marquee-track">{content}</div>
          <div className="marquee-track">{content}</div>
        </div>
      </div>

      {/* Inline styles for the marquee animation */}
      <style>{`
          .marquee-wrap { 
            height: auto;
            min-height: 40px;
            display: flex;
            align-items: center;
            position: relative;
          }
          
          @media (min-width: 768px) {
            .marquee-wrap { 
              min-height: 48px;
            }
          }
          
          .marquee-track-wrapper { 
            display: flex; 
            align-items: center;
            animation-name: marquee-scroll;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            white-space: nowrap;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
  
          .marquee-track { 
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
            padding-right: 2rem;
          }
  
          @keyframes marquee-scroll {
            0% { transform: translateY(-50%) translateX(0%); }
            100% { transform: translateY(-50%) translateX(-100%); }
          }
  
          /* Respect user reduced motion preferences */
          @media (prefers-reduced-motion: reduce) {
            .marquee-track-wrapper { 
              animation: none !important;
              position: static;
              transform: none;
              justify-content: center;
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .marquee-track:last-child {
              display: none;
            }
          }
          
          /* Mobile optimizations */
          @media (max-width: 640px) {
            .marquee-track-wrapper {
              animation-duration: ${speed * 0.8}s !important;
            }
          }
        `}</style>
    </div>
  );
};

export default Banner;
