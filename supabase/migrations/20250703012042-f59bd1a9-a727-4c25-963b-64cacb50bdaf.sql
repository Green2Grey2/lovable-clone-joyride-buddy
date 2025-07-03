-- 1. Add entry method tracking
ALTER TABLE activities 
ADD COLUMN entry_method VARCHAR(20) DEFAULT 'manual';

-- 2. Update existing records
UPDATE activities SET entry_method = 'manual' WHERE entry_method IS NULL;

-- 3. Create index for performance
CREATE INDEX idx_activities_entry_method ON activities(entry_method);