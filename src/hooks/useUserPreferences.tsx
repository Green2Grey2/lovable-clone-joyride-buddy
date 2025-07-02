import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  autoPlayVideos: boolean;
  showAnimations: boolean;
  language: string;
  timezone: string;
  notifications: {
    push: boolean;
    email: boolean;
    inApp: boolean;
    sound: boolean;
    vibrate: boolean;
  };
  privacy: {
    shareActivity: boolean;
    showOnLeaderboard: boolean;
    allowAnalytics: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  soundEnabled: true,
  hapticEnabled: true,
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  colorBlindMode: 'none',
  autoPlayVideos: true,
  showAnimations: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    push: true,
    email: true,
    inApp: true,
    sound: true,
    vibrate: true,
  },
  privacy: {
    shareActivity: true,
    showOnLeaderboard: true,
    allowAnalytics: true,
  },
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  loading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage or database
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // First, check system preferences
        const systemPreferences: Partial<UserPreferences> = {};
        
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          systemPreferences.reducedMotion = true;
          systemPreferences.showAnimations = false;
        }
        
        if (window.matchMedia('(prefers-contrast: high)').matches) {
          systemPreferences.highContrast = true;
        }
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches && preferences.theme === 'system') {
          document.documentElement.classList.add('dark');
        }

        // Load from localStorage for anonymous users
        const localPrefs = localStorage.getItem('userPreferences');
        if (localPrefs) {
          const parsed = JSON.parse(localPrefs);
          setPreferences({ ...defaultPreferences, ...systemPreferences, ...parsed });
        } else {
          setPreferences({ ...defaultPreferences, ...systemPreferences });
        }

        // Load from database for authenticated users
        if (user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data && !error && typeof data === 'object') {
            // Map database fields to our preference structure
            const dbPrefs = {
              theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
              language: data.language || 'en',
              soundEnabled: data.sound_enabled ?? true,
              hapticEnabled: data.haptic_enabled ?? true,
              // Keep other preferences from defaults/system
            };
            setPreferences({ ...defaultPreferences, ...systemPreferences, ...dbPrefs });
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      if (preferences.theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(preferences.theme);
      }

      // Apply font size
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px',
      };
      root.style.fontSize = fontSizeMap[preferences.fontSize];

      // Apply color blind mode
      if (preferences.colorBlindMode !== 'none') {
        root.setAttribute('data-color-blind-mode', preferences.colorBlindMode);
      } else {
        root.removeAttribute('data-color-blind-mode');
      }

      // Apply high contrast
      if (preferences.highContrast) {
        root.setAttribute('data-high-contrast', 'true');
      } else {
        root.removeAttribute('data-high-contrast');
      }

      // Apply reduced motion
      if (preferences.reducedMotion) {
        root.setAttribute('data-reduced-motion', 'true');
      } else {
        root.removeAttribute('data-reduced-motion');
      }
    };

    applyTheme();
  }, [preferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));

      // Save to database for authenticated users
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme: newPreferences.theme,
            language: newPreferences.language,
            sound_enabled: newPreferences.soundEnabled,
            haptic_enabled: newPreferences.hapticEnabled,
            notifications_enabled: newPreferences.notifications.push,
            privacy_mode: !newPreferences.privacy.shareActivity,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
          
        if (error) {
          console.error('Error saving preferences:', error);
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const resetPreferences = async () => {
    try {
      setPreferences(defaultPreferences);
      localStorage.removeItem('userPreferences');

      if (user) {
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences, loading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    // Return default values when used outside provider
    return {
      preferences: defaultPreferences,
      updatePreferences: async () => {},
      resetPreferences: async () => {},
      loading: false,
    };
  }
  return context;
};