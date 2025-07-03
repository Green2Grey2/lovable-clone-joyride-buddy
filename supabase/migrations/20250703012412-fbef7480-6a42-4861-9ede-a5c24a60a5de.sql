-- Phase 2: Add verification fields
-- 1. Add verification fields
ALTER TABLE activities 
ADD COLUMN verification_status VARCHAR(20) DEFAULT 'verified',
ADD COLUMN verification_required BOOLEAN DEFAULT false;

-- 2. Update existing entries
UPDATE activities 
SET verification_status = 'verified', 
    verification_required = false 
WHERE entry_method != 'quick_entry';

UPDATE activities 
SET verification_status = 'pending', 
    verification_required = true 
WHERE entry_method = 'quick_entry';

-- 3. Add to user_stats for tracking
ALTER TABLE user_stats
ADD COLUMN pending_steps INTEGER DEFAULT 0,
ADD COLUMN verified_steps INTEGER DEFAULT 0;