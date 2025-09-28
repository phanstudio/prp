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
 * - Each track is 50% width of the moving area and allows text wrapping (white-space: normal)
 * - Built with Tailwind / DaisyUI-friendly classes — drop into a project using those
 */
const Banner: FC<ScrollingBannerProps> = ({
  messages,
  speed = 18,
  bgClass = "bg-base-200",
  className = "text-sm md:text-base",
}) => {
  const content = (
    <div className={`flex-wrap items-center p-2 ${className}`}>
      {messages.map((m, i) => (
        <span key={i} className="leading-tight mb-2 whitespace-nowrap px-2">
          {m}
        </span>
      ))}
    </div>
  );

  // animation duration depends on speed prop
  const style: React.CSSProperties = {
    animationDuration: `${speed}s`,
  };

  return (
    <div className={`w-full overflow-hidden ${bgClass} border border-base-300 rounded-none`}>
      {/*
        marquee-wrap: the viewport
        marquee-track-wrapper: the moving element (flex) which will be translated
        marquee-track: each duplicated block (50% width) that contains wrap-able text
      */}
      <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-[var(--tw-bg-opacity,theme(colors.base-200))] to-transparent z-10" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[var(--tw-bg-opacity,theme(colors.base-200))] to-transparent z-10" />
      <div
        className="marquee-wrap relative w-full"
        aria-hidden={false}
        role="region"
        aria-label="Scrolling announcements"
      >
        <div className="marquee-track-wrapper flex whitespace-normal" style={style}>
          <div className="marquee-track w-1/2 flex-shrink-0">
            {content}
          </div>
          <div className="marquee-track w-1/2 flex-shrink-0">
            {content}
          </div>
        </div>
      </div>

      {/* Inline styles for the marquee animation. You can move these into your global CSS if preferred. */}
      <style>{`
        /* Make sure the wrapper hides the overflow and the track-wrapper is twice as wide logically */
        .marquee-wrap { height: auto; }
        .marquee-track-wrapper { 
          display: flex; 
          width: 200%; /* two tracks side-by-side */
          align-items: flex-start;
          animation-name: marquee-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* Each track is 50% of the wrapper so moving -50% gives a seamless loop */
        .marquee-track { box-sizing: border-box; }

        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        /* Respect user reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track-wrapper { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default Banner;

/*
  Usage example (place in any React component):

  import ScrollingBanner from "./ScrollingBanner";

  <ScrollingBanner
    messages={[
      "Welcome to the site — new features are live!",
      "Maintenance tonight 00:00 - expect brief downtime.",
      "Tip: Press / to focus search."
    ]}
    speed={20} // seconds (lower => faster)
    bgClass="bg-primary text-primary-content"
    className="text-sm md:text-base"
  />
*/
