import { useEffect, useRef, useState } from 'react';

interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right' | null;
  distance: number;
  velocity: number;
}

interface UseSwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const useSwipe = (options: UseSwipeOptions = {}) => {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipe,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      if (distance < threshold || velocity < velocityThreshold) return;

      let direction: 'up' | 'down' | 'left' | 'right';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const swipeData: SwipeDirection = {
        direction,
        distance,
        velocity,
      };

      onSwipe?.(swipeData);

      switch (direction) {
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
      }

      setTouchStart(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, threshold, velocityThreshold, onSwipe, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  return elementRef;
};

interface UseScrollDirectionOptions {
  threshold?: number;
  onScrollUp?: () => void;
  onScrollDown?: () => void;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 10, onScrollUp, onScrollDown } = options;
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current || window;

    const handleScroll = () => {
      const scrollY = element === window 
        ? window.scrollY 
        : (element as HTMLElement).scrollTop;
      
      const difference = scrollY - lastScrollY.current;

      if (Math.abs(difference) < threshold) return;

      const direction = difference > 0 ? 'down' : 'up';
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
        
        if (direction === 'up') {
          onScrollUp?.();
        } else {
          onScrollDown?.();
        }
      }

      lastScrollY.current = scrollY;
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, scrollDirection, onScrollUp, onScrollDown]);

  return { scrollDirection, elementRef };
};

interface UsePinchZoomOptions {
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
  onZoom?: (scale: number) => void;
}

export const usePinchZoom = (options: UsePinchZoomOptions = {}) => {
  const { onPinchStart, onPinchEnd, onZoom } = options;
  const [isPinching, setIsPinching] = useState(false);
  const [scale, setScale] = useState(1);
  const initialDistance = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const getDistance = (touches: TouchList) => {
      const touch1 = touches[0];
      const touch2 = touches[1];
      return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        initialDistance.current = getDistance(e.touches);
        onPinchStart?.();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const newScale = currentDistance / initialDistance.current;
        setScale(newScale);
        onZoom?.(newScale);
      }
    };

    const handleTouchEnd = () => {
      if (isPinching) {
        setIsPinching(false);
        onPinchEnd?.();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPinching, onPinchStart, onPinchEnd, onZoom]);

  return { isPinching, scale, elementRef };
};

interface UseLongPressOptions {
  duration?: number;
  onLongPress?: () => void;
  onPress?: () => void;
}

export const useLongPress = (options: UseLongPressOptions = {}) => {
  const { duration = 500, onLongPress, onPress } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const start = () => {
    isLongPress.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.();
    }, duration);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const end = () => {
    clear();
    if (!isLongPress.current) {
      onPress?.();
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: end,
  };
};

// Haptic feedback hook for mobile devices
export const useHapticFeedback = () => {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const lightTap = () => vibrate(10);
  const mediumTap = () => vibrate(50);
  const heavyTap = () => vibrate(100);
  const doubleTap = () => vibrate([50, 50, 50]);
  const successPattern = () => vibrate([100, 50, 100]);
  const errorPattern = () => vibrate([200, 100, 200, 100, 200]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    successPattern,
    errorPattern,
  };
};