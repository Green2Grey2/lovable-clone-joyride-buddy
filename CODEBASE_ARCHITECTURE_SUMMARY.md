# Joyride Buddy - Codebase Architecture Summary

## Overview
Joyride Buddy is a comprehensive wellness and fitness tracking platform built with React, TypeScript, and Supabase. The application supports step tracking, activity monitoring, social features, achievements, and department-based challenges.

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context API (AuthContext, AppContext, UserStatsContext)
- **Routing**: React Router v6
- **Mobile**: Capacitor for iOS/Android deployment
- **Data Fetching**: Tanstack React Query v5

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage (implied from verification_image_url fields)

## Project Structure

```
lovable-clone-joyride-buddy/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   ├── lib/                # Utility libraries
│   ├── pages/              # Route page components
│   ├── styles/             # Global styles and animations
│   └── utils/              # Utility functions and services
├── public/                 # Static assets
└── supabase/              # Database migrations and config
```

## Database Schema

### Core Tables

#### **profiles**
- User profile information including name, email, department, goals
- Contains fitness data: height, weight, age, sex
- Settings: weekly_goal, daily_step_goal, notification_preferences
- Verification: trust_score, auto_verify_enabled

#### **user_stats**
- Comprehensive user statistics tracking
- Steps: today_steps, weekly_steps, monthly_steps, yearly_steps, lifetime_steps
- Streaks: current_streak, longest_streak, average_streak_length
- Health metrics: calories_burned, heart_rate, water_intake, sleep_hours
- Goals: weekly_goal_steps, weekly_goal_calories, weekly_goal_duration

#### **activities**
- Activity records with type, date, duration, distance
- Health data: calories_burned, heart_rate_avg, heart_rate_max
- Verification: verification_status, verification_image_url, verified_by
- Supports manual entries and weather conditions

#### **daily_steps**
- Daily step tracking per user
- Simple structure: user_id, date, steps, timestamps

### Social Features

#### **social_activities**
- Social feed posts with type, title, description
- JSON data field for flexible content
- Timestamps and user associations

#### **activity_likes**
- Likes on social activities
- Many-to-many relationship between users and activities

### Gamification

#### **achievements**
- Achievement definitions with categories, icons, points
- Criteria stored as JSON for flexible conditions
- Active/inactive status and sort ordering

#### **user_achievements**
- User's earned achievements with progress tracking
- Earned date and additional data storage

### Team Features

#### **challenges**
- Team challenges with start/end dates, targets
- Created by users with active status tracking

#### **collaborative_goals**
- Department-based goals with targets and units
- Time-based with active status

#### **department_settings**
- Department configuration and limits
- Active status and size constraints

### Administrative

#### **user_roles**
- Role-based access control
- Enum: admin, moderator, user, manager

#### **notifications**
- User notifications with read status
- Different types and event associations

#### **editorial_media**
- Content management for articles and videos
- Publishing workflow with view tracking

## Key Features

### 1. Activity Tracking
- Manual step entry
- GPS-based activity tracking
- Multiple activity types (walk, run, cycle, workout)
- Calorie calculation based on user metrics
- Heart rate zone tracking

### 2. Social & Gamification
- Activity feed with likes and interactions
- Achievement system with progress tracking
- Department-based leaderboards
- Streak tracking and celebrations
- Personal records tracking

### 3. Health Integration
- Apple Health/Google Fit integration capabilities
- Comprehensive health metrics tracking
- Sleep and hydration monitoring
- Heart rate analysis

### 4. Team Challenges
- Department vs department competitions
- Time-based challenges with targets
- Real-time leaderboard updates
- Collaborative goals

### 5. Content & Media
- Editorial content system
- Video library integration
- Apple News-style feed
- Content categorization and tagging

### 6. User Management
- Role-based permissions (admin, manager, moderator, user)
- Department assignments
- Trust score system for auto-verification
- Privacy settings

## Authentication Flow
1. Supabase Auth handles user registration/login
2. AuthContext manages session state
3. ProtectedRoute components ensure authentication
4. User profile created on first login

## Data Flow
1. **User Stats**: Centralized in UserStatsContext, synced with Supabase
2. **Activities**: Created through ActivitySelector, tracked in real-time
3. **Social Feed**: Real-time updates via Supabase subscriptions
4. **Achievements**: Checked via database functions on activity completion

## Notable Patterns
- Extensive use of React Context for state management
- Component composition with responsive design utilities
- Error boundaries for graceful error handling
- Sound effects and haptic feedback for better UX
- Progressive enhancement for mobile features

## Security Considerations
- Row Level Security (RLS) implied by user_id associations
- Role-based access control for admin features
- Trust score system for activity verification
- Auto-verification for trusted users

## Performance Optimizations
- Lazy loading of secondary pages
- React Query for efficient data caching
- Incremental view count updates
- Materialized views for analytics (verification_analytics, media_feed)

## Mobile Considerations
- Capacitor integration for native features
- GPS and geolocation capabilities
- Responsive design with mobile-first approach
- Touch-optimized interactions
