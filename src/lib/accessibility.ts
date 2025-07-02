// Accessibility utilities and helpers
export const a11y = {
  // ARIA live region announcements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  // Focus management
  focusTrap: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  },

  // Skip links
  skipToContent: () => {
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  },

  // Reduced motion preference
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // High contrast mode detection
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Screen reader detection (use sparingly)
  isScreenReaderActive: () => {
    return document.body.getAttribute('data-screen-reader') === 'true';
  },

  // Keyboard navigation helpers
  isUsingKeyboard: () => {
    return document.body.classList.contains('using-keyboard');
  },

  // ARIA helpers
  ariaLabel: (label: string) => ({ 'aria-label': label }),
  ariaDescribedBy: (id: string) => ({ 'aria-describedby': id }),
  ariaLabelledBy: (id: string) => ({ 'aria-labelledby': id }),
  ariaExpanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  ariaHidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  ariaPressed: (pressed: boolean) => ({ 'aria-pressed': pressed }),
  ariaChecked: (checked: boolean) => ({ 'aria-checked': checked }),
  ariaCurrent: (current: string | boolean) => ({ 'aria-current': current }),
  ariaDisabled: (disabled: boolean) => ({ 'aria-disabled': disabled }),
  ariaValueNow: (value: number) => ({ 'aria-valuenow': value }),
  ariaValueMin: (value: number) => ({ 'aria-valuemin': value }),
  ariaValueMax: (value: number) => ({ 'aria-valuemax': value }),
  ariaValueText: (text: string) => ({ 'aria-valuetext': text }),
  role: (role: string) => ({ role }),
};

// Initialize keyboard navigation detection
if (typeof window !== 'undefined') {
  // Track keyboard vs mouse usage
  window.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('using-keyboard');
    }
  });

  // Detect screen reader (basic heuristic)
  const detectScreenReader = () => {
    const indicators = [
      window.navigator.userAgent.includes('NVDA'),
      window.navigator.userAgent.includes('JAWS'),
      document.documentElement.classList.contains('sr'),
    ];
    
    if (indicators.some(Boolean)) {
      document.body.setAttribute('data-screen-reader', 'true');
    }
  };

  detectScreenReader();
}

// Accessible color contrast checker
export const meetsContrastRatio = (foreground: string, background: string, isLargeText = false): boolean => {
  // This is a simplified check - in production, use a proper color contrast library
  const requiredRatio = isLargeText ? 3 : 4.5;
  // Placeholder - implement actual contrast calculation
  return true;
};

// Focus visible polyfill for older browsers
export const ensureFocusVisible = () => {
  try {
    document.querySelector(':focus-visible');
  } catch (e) {
    // Polyfill :focus-visible - commented out for now
    // import('focus-visible');
  }
};