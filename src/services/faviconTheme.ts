/**
 * @file faviconTheme.ts
 * @description Manages dynamic 24-hour alternating SVG favicon for JeeRaf CBT.
 * 
 * Alternates between:
 * - /jeeraf-logo-white.svg (White SVG badge)
 * - /jeeraf-logo-black.svg (Black SVG badge)
 * 
 * Runs a continuous 24-hour epoch cycle to seamlessly flip the favicon every 24 hours.
 */

const CYCLE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type FaviconVariant = 'white' | 'black';

/**
 * Calculates whether the current 24-hour cycle is 'white' or 'black'.
 * Using Math.floor(Date.now() / 24h) ensures all devices globally stay in sync.
 */
export function getFavicon24HourVariant(): FaviconVariant {
  const currentCycleIndex = Math.floor(Date.now() / CYCLE_MS);
  return currentCycleIndex % 2 === 0 ? 'white' : 'black';
}

/**
 * Returns the exact SVG asset URL for the active 24-hour cycle.
 */
export function getFaviconUrl(variant?: FaviconVariant): string {
  const activeVariant = variant || getFavicon24HourVariant();
  return activeVariant === 'white' ? '/jeeraf-with-name-white.svg' : '/jeeraf-with-name-black.svg';
}

/**
 * Sets the active SVG favicon in document <head>.
 */
export function applyDynamicFavicon(): FaviconVariant {
  if (typeof document === 'undefined') return 'white';

  const variant = getFavicon24HourVariant();
  const faviconUrl = getFaviconUrl(variant);

  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.type = 'image/svg+xml';
  link.href = faviconUrl;
  return variant;
}

/**
 * Initializes the 24-hour favicon watcher.
 * Applies immediately on mount and checks periodically for 24-hour rollover.
 */
export function initFavicon24HourCycle(): () => void {
  if (typeof window === 'undefined') return () => {};

  applyDynamicFavicon();

  // Check every 5 minutes if the 24-hour boundary has crossed
  const intervalId = window.setInterval(() => {
    applyDynamicFavicon();
  }, 5 * 60 * 1000);

  return () => {
    window.clearInterval(intervalId);
  };
}
