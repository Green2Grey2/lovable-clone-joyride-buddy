import React, { createContext, useContext, useState, useEffect } from 'react';
import { useScrollDirection } from '@/hooks/useGestures';

interface NavigationContextType {
  isBottomNavVisible: boolean;
  setIsBottomNavVisible: (visible: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  // Auto-hide navigation on scroll
  const { scrollDirection } = useScrollDirection({
    threshold: 20,
    onScrollDown: () => setIsBottomNavVisible(false),
    onScrollUp: () => setIsBottomNavVisible(true),
  });

  return (
    <NavigationContext.Provider value={{
      isBottomNavVisible,
      setIsBottomNavVisible,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};