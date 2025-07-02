
// MET (Metabolic Equivalent of Task) values for different activities
const MET_VALUES = {
  walking: 3.5,
  running: 8.0,
  cycling: 7.5,
  swimming: 6.0,
  yoga: 2.5,
  strength_training: 6.0,
  dancing: 4.8,
  hiking: 6.0,
  basketball: 8.0,
  tennis: 7.3
};

interface UserHealthData {
  weight: number; // kg
  height: number; // cm
  age: number;
  sex: 'male' | 'female';
}

// Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
export const calculateBMR = (userData: UserHealthData): number => {
  const { weight, height, age, sex } = userData;
  
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calculate calories burned for a specific activity
export const calculateCaloriesBurned = (
  activity: string,
  durationInMinutes: number,
  userData: UserHealthData
): number => {
  const metValue = MET_VALUES[activity as keyof typeof MET_VALUES] || 4.0;
  const weightInKg = userData.weight;
  
  // Calories = MET × weight (kg) × time (hours)
  const caloriesPerHour = metValue * weightInKg;
  const caloriesPerMinute = caloriesPerHour / 60;
  
  return Math.round(caloriesPerMinute * durationInMinutes);
};

// Calculate calories burned from steps
export const calculateCaloriesFromSteps = (
  steps: number,
  userData: UserHealthData
): number => {
  // Average: 0.04 calories per step, adjusted for weight
  const baseCaloriesPerStep = 0.04;
  const weightAdjustment = userData.weight / 70; // 70kg as baseline
  const caloriesPerStep = baseCaloriesPerStep * weightAdjustment;
  
  return Math.round(steps * caloriesPerStep);
};

// Calculate daily calorie needs
export const calculateDailyCalorieNeeds = (
  userData: UserHealthData,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
): number => {
  const bmr = calculateBMR(userData);
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Get all available activities
export const getAvailableActivities = (): string[] => {
  return Object.keys(MET_VALUES);
};
