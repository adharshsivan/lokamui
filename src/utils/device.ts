/**
 * Lokam Mini — Device Detection Utilities
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isTouch && (isMobileUa || window.innerWidth < 820);
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
