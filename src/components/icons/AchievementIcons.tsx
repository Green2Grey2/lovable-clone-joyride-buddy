import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Streak Achievements
export const WeekWarriorIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="weekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#FF8E53" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#weekGradient)" stroke="white" strokeWidth="2"/>
    <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="16" y="26" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">7D</text>
  </svg>
);

export const FortnightFighterIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="fortnightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F093FB" />
        <stop offset="100%" stopColor="#F5576C" />
      </linearGradient>
    </defs>
    <path d="M16 2L20 12H30L22 18L26 28L16 22L6 28L10 18L2 12H12L16 2Z" fill="url(#fortnightGradient)" stroke="white" strokeWidth="1"/>
    <text x="16" y="18" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">14</text>
  </svg>
);

export const MonthlyMasterIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="monthlyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4FACFE" />
        <stop offset="100%" stopColor="#00F2FE" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="24" height="20" rx="3" fill="url(#monthlyGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    <text x="16" y="19" textAnchor="middle" fill="#4FACFE" fontSize="5" fontWeight="bold">30</text>
    <rect x="7" y="3" width="2" height="6" fill="white" rx="1"/>
    <rect x="23" y="3" width="2" height="6" fill="white" rx="1"/>
  </svg>
);

export const ConsistencyKingIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <path d="M6 12L10 8L16 12L22 8L26 12L24 22H8L6 12Z" fill="url(#crownGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="10" cy="8" r="2" fill="#FF6B6B"/>
    <circle cx="16" cy="12" r="2" fill="#FF6B6B"/>
    <circle cx="22" cy="8" r="2" fill="#FF6B6B"/>
    <text x="16" y="19" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">KING</text>
  </svg>
);

export const CenturyClubIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="centuryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#centuryGradient)" stroke="white" strokeWidth="2"/>
    <path d="M16 4L18 10L24 8L20 14L28 16L20 18L24 24L18 22L16 28L14 22L8 24L12 18L4 16L12 14L8 8L14 10L16 4Z" fill="white" opacity="0.9"/>
    <text x="16" y="19" textAnchor="middle" fill="#667eea" fontSize="4" fontWeight="bold">100</text>
  </svg>
);

// Milestone Achievements
export const FirstStepsIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="firstStepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a8edea" />
        <stop offset="100%" stopColor="#fed6e3" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#firstStepsGradient)" stroke="white" strokeWidth="2"/>
    <path d="M12 8C12 8 14 10 16 12C18 10 20 8 20 8" stroke="#4FACFE" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="12" cy="14" rx="2" ry="3" fill="#4FACFE" transform="rotate(-15 12 14)"/>
    <ellipse cx="20" cy="18" rx="2" ry="3" fill="#4FACFE" transform="rotate(15 20 18)"/>
    <path d="M12 20L16 24L20 20" stroke="#4FACFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const StepChampionIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="championGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#11998e" />
        <stop offset="100%" stopColor="#38ef7d" />
      </linearGradient>
    </defs>
    <path d="M16 4L18 10L24 8L20 14L28 16L20 18L24 24L18 22L16 28L14 22L8 24L12 18L4 16L12 14L8 8L14 10L16 4Z" fill="url(#championGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    <text x="16" y="18" textAnchor="middle" fill="#11998e" fontSize="3" fontWeight="bold">10K</text>
  </svg>
);

export const ExplorerIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="explorerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffecd2" />
        <stop offset="100%" stopColor="#fcb69f" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#explorerGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="#FF6B6B" strokeWidth="2"/>
    <path d="M16 8L18 14L24 16L18 18L16 24L14 18L8 16L14 14L16 8Z" fill="#FF6B6B"/>
    <circle cx="16" cy="16" r="2" fill="white"/>
  </svg>
);

export const CalorieCrusherIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff9a9e" />
        <stop offset="100%" stopColor="#fecfef" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#calorieGradient)" stroke="white" strokeWidth="2"/>
    <path d="M12 8C12 8 14 12 16 16C18 12 20 8 20 8C22 10 20 14 18 18C20 20 22 24 20 24C18 22 16 20 16 16C16 20 14 22 12 24C10 24 12 20 14 18C12 14 10 10 12 8Z" fill="#FF4757"/>
    <text x="16" y="27" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">500</text>
  </svg>
);

export const InfernoIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="infernoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b6b" />
        <stop offset="50%" stopColor="#ff8e53" />
        <stop offset="100%" stopColor="#ff4757" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#infernoGradient)" stroke="white" strokeWidth="2"/>
    <path d="M10 6C10 6 12 10 14 14C16 10 18 6 18 6C20 8 18 12 16 16C18 18 20 22 18 22C16 20 14 18 14 14C14 18 12 20 10 22C8 22 10 18 12 16C10 12 8 8 10 6Z" fill="#FFD700"/>
    <path d="M14 10C14 10 15 12 16 14C17 12 18 10 18 10C19 11 18 13 17 15C18 16 19 18 18 18C17 17 16 16 16 14C16 16 15 17 14 18C13 18 14 16 15 15C14 13 13 11 14 10Z" fill="#FF4757"/>
    <text x="16" y="27" textAnchor="middle" fill="white" fontSize="3" fontWeight="bold">1000</text>
  </svg>
);

// Special Achievements
export const EarlyBirdIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="earlyBirdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffeaa7" />
        <stop offset="100%" stopColor="#fab1a0" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#earlyBirdGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="26" cy="8" r="4" fill="#FFD700" stroke="white" strokeWidth="1"/>
    <path d="M26 4L28 8L32 6L30 10" stroke="#FFB74D" strokeWidth="1"/>
    <ellipse cx="14" cy="14" rx="6" ry="4" fill="#6C5CE7"/>
    <circle cx="12" cy="12" r="1" fill="white"/>
    <path d="M8 14C8 14 6 16 6 18" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 16C20 16 22 18 24 18" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SocialButterflyIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="butterflyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fd79a8" />
        <stop offset="100%" stopColor="#fdcb6e" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#butterflyGradient)" stroke="white" strokeWidth="2"/>
    <ellipse cx="10" cy="12" rx="4" ry="6" fill="#E17055" opacity="0.8"/>
    <ellipse cx="22" cy="12" rx="4" ry="6" fill="#E17055" opacity="0.8"/>
    <ellipse cx="10" cy="20" rx="3" ry="4" fill="#6C5CE7" opacity="0.8"/>
    <ellipse cx="22" cy="20" rx="3" ry="4" fill="#6C5CE7" opacity="0.8"/>
    <line x1="16" y1="8" x2="16" y2="24" stroke="#2D3436" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="10" r="1" fill="#2D3436"/>
    <path d="M14 8L16 6L18 8" stroke="#2D3436" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const TeamPlayerIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#74b9ff" />
        <stop offset="100%" stopColor="#0984e3" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#teamGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
    <circle cx="20" cy="12" r="3" fill="white" opacity="0.9"/>
    <circle cx="16" cy="20" r="3" fill="white" opacity="0.9"/>
    <path d="M12 15L16 17L20 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 20L16 17L18 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const InfluencerIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="influencerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#influencerGradient)" stroke="white" strokeWidth="2"/>
    <path d="M8 20L12 16L8 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 12L20 16L24 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="16" r="3" fill="white"/>
    <text x="16" y="27" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">50</text>
  </svg>
);

export const GoalCrusherIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f093fb" />
        <stop offset="100%" stopColor="#f5576c" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#goalGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="4" fill="none" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="1" fill="white"/>
    <path d="M8 16L14 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const DistanceRunnerIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="runnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#89f7fe" />
        <stop offset="100%" stopColor="#66a6ff" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#runnerGradient)" stroke="white" strokeWidth="2"/>
    <circle cx="16" cy="16" r="2" fill="white"/>
    <path d="M8 8L16 16L24 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 24L16 16L24 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="16" y="27" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">5MI</text>
  </svg>
);

export const MarathonWalkerIcon: React.FC<IconProps> = ({ className = "h-8 w-8", size }) => (
  <svg 
    className={className} 
    width={size || "32"} 
    height={size || "32"} 
    viewBox="0 0 32 32" 
    fill="none"
  >
    <defs>
      <linearGradient id="marathonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffeaa7" />
        <stop offset="100%" stopColor="#fab1a0" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" fill="url(#marathonGradient)" stroke="white" strokeWidth="2"/>
    <path d="M8 12L16 8L24 12L16 16L8 12Z" fill="white" opacity="0.9"/>
    <path d="M8 16L16 12L24 16L16 20L8 16Z" fill="white" opacity="0.7"/>
    <path d="M8 20L16 16L24 20L16 24L8 20Z" fill="white" opacity="0.5"/>
    <text x="16" y="29" textAnchor="middle" fill="white" fontSize="3" fontWeight="bold">20K</text>
  </svg>
);

// Icon mapping object
export const achievementIconMap = {
  // Streak achievements
  'Week Warrior': WeekWarriorIcon,
  'Fortnight Fighter': FortnightFighterIcon,
  'Monthly Master': MonthlyMasterIcon,
  'Consistency King': ConsistencyKingIcon,
  'Century Club': CenturyClubIcon,
  
  // Milestone achievements
  'First Steps': FirstStepsIcon,
  'Step Champion': StepChampionIcon,
  'Explorer': ExplorerIcon,
  'Marathon Walker': MarathonWalkerIcon,
  'Distance Runner': DistanceRunnerIcon,
  'Calorie Crusher': CalorieCrusherIcon,
  'Inferno': InfernoIcon,
  
  // Special achievements
  'Early Bird': EarlyBirdIcon,
  'Social Butterfly': SocialButterflyIcon,
  'Team Player': TeamPlayerIcon,
  'Influencer': InfluencerIcon,
  'Goal Crusher': GoalCrusherIcon,
  
  // Default fallbacks
  default: FirstStepsIcon
};