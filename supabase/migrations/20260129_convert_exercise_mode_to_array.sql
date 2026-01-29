-- Migration to convert exercise_mode to an array of enums
-- This allows engineers to select multiple exercise modes

-- 1. Create a temporary column
ALTER TABLE profiles ADD COLUMN exercise_mode_new exercise_mode[] DEFAULT '{}';

-- 2. Migrate data from old column to new column
UPDATE profiles 
SET exercise_mode_new = ARRAY[exercise_mode]
WHERE exercise_mode IS NOT NULL;

-- 3. Drop the old column
ALTER TABLE profiles DROP COLUMN exercise_mode;

-- 4. Rename the new column to the original name
ALTER TABLE profiles RENAME COLUMN exercise_mode_new TO exercise_mode;

-- 5. Add a comment
COMMENT ON COLUMN profiles.exercise_mode IS 'Array of exercise modes the engineer operates under';
