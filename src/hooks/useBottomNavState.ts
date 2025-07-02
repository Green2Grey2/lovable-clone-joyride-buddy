import { useState, useEffect } from 'react';

// Global state for bottom navigation visibility
let globalNavVisible = true;
const listeners = new Set<(visible: boolean) => void>();

const notifyListeners = (visible: boolean) => {
  listeners.forEach(listener => listener(visible));
};

export const useBottomNavState = () => {
  const [isNavVisible, setIsNavVisible] = useState(globalNavVisible);

  useEffect(() => {
    const listener = (visible: boolean) => {
      setIsNavVisible(visible);
    };
    
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setNavVisible = (visible: boolean) => {
    globalNavVisible = visible;
    notifyListeners(visible);
  };

  return {
    isNavVisible,
    setNavVisible
  };
};