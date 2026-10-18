export function getBrowser(): 'Chrome' | 'Safari' | 'Firefox' | 'Internet Explorer' | 'Edge' | 'unknown' {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf('chrome') > -1) {
    return 'Chrome';
  }
  if (userAgent.indexOf('safari') > -1) {
    return 'Safari';
  }
  if (userAgent.indexOf('firefox') > -1) {
    return 'Firefox';
  }
  if (userAgent.indexOf('msie') > -1 || userAgent.indexOf('trident') > -1) {
    return 'Internet Explorer';
  }
  if (userAgent.indexOf('edge') > -1) {
    return 'Edge';
  }
  return 'unknown';
}

export function getOsShortcut() {
  const isMacOs = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('mac') !== 0 : true;

  return isMacOs ? '⌘' : 'Ctrl';
}
