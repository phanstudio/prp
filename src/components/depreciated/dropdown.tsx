import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

type DropdownItem = React.ReactNode | ((props: { close: () => void }) => React.ReactNode);

export const DropDown = ({
  children,
  data,
}: Readonly<{ children: React.ReactNode; data: DropdownItem[] }>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const PADDING = 16;

    let top = triggerRect.bottom + window.scrollY;
    let left = triggerRect.left + window.scrollX;

    // Check if dropdown would overflow right edge
    if (triggerRect.left + dropdownRect.width > viewportWidth - PADDING) {
      // Align to right edge of trigger
      left = triggerRect.right + window.scrollX - dropdownRect.width;
    }

    // Check if dropdown would overflow left edge
    if (left < PADDING + window.scrollX) {
      left = PADDING + window.scrollX;
    }

    // Check if dropdown would overflow bottom edge
    if (triggerRect.bottom + dropdownRect.height > viewportHeight - PADDING) {
      // Position above trigger instead
      top = triggerRect.top + window.scrollY - dropdownRect.height;
    }

    // Check if dropdown would overflow top edge when positioned above
    if (top < PADDING + window.scrollY) {
      // Revert to below if there's more space
      top = triggerRect.bottom + window.scrollY;
    }

    setCoords({ top, left });
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsPositioned(false);
    }
    setIsOpen((prev) => !prev);
  };

  // Recalculate position after dropdown opens and renders
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        calculatePosition();
        setIsPositioned(true);
      });
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Close on resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Update position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) calculatePosition();
    };
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Trigger */}
      <div ref={triggerRef} className="relative w-fit z-10" onClick={handleToggle}>
        {children}
      </div>

      {/* Backdrop */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/0 z-40"
            onClick={() => setIsOpen(false)}
          />,
          document.body
        )}

      {/* Dropdown */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-[50] shadow-lg rounded-md overflow-hidden"
            style={{
              position: "absolute",
              top: coords.top,
              left: coords.left,
              opacity: isPositioned ? 1 : 0,
              transition: 'opacity 0.1s',
            }}
          >
            {data.map((ele: DropdownItem, id) => (
              <div key={id}>
                {typeof ele === "function" ? ele({ close }) : ele}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};