
import { useState, useEffect } from 'react';

interface ChallengeSettings {
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const useChallengeSettings = () => {
  const [challengeSettings, setChallengeSettings] = useState<ChallengeSettings>(() => {
    const saved = localStorage.getItem('walkingChallengeSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      isActive: false
    };
  });

  const updateChallengeSettings = (newSettings: Partial<ChallengeSettings>) => {
    const updated = { ...challengeSettings, ...newSettings };
    setChallengeSettings(updated);
    localStorage.setItem('walkingChallengeSettings', JSON.stringify(updated));
  };

  return {
    challengeSettings,
    updateChallengeSettings
  };
};
