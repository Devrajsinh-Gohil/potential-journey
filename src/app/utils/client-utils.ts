/**
 * Safe localStorage functions that work with Next.js's SSR
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage', error);
      return false;
    }
  }
}; 