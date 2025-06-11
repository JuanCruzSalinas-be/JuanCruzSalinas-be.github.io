/*
  # User Profiles and Data Storage

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `level` (integer, default 0)
      - `xp` (integer, default 0)
      - `xp_to_next_level` (integer, default 100)
      - `personal_info` (jsonb, stores survey data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_quiz_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `quiz_id` (text)
      - `score` (integer)
      - `earned_xp` (integer)
      - `completed_at` (timestamp)
    
    - `user_quest_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `quest_id` (text)
      - `completed_at` (timestamp)
      - `reset_date` (date, for daily quest tracking)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Ensure data isolation between users
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  level integer DEFAULT 0,
  xp integer DEFAULT 0,
  xp_to_next_level integer DEFAULT 100,
  personal_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_quiz_completions table
CREATE TABLE IF NOT EXISTS user_quiz_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  quiz_id text NOT NULL,
  score integer NOT NULL,
  earned_xp integer NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- Create user_quest_completions table
CREATE TABLE IF NOT EXISTS user_quest_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  quest_id text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  reset_date date DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for user_quiz_completions
CREATE POLICY "Users can view own quiz completions"
  ON user_quiz_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz completions"
  ON user_quiz_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for user_quest_completions
CREATE POLICY "Users can view own quest completions"
  ON user_quest_completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quest completions"
  ON user_quest_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own quest completions"
  ON user_quest_completions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_quiz_completions_user_id ON user_quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_completions_quiz_id ON user_quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_completions_user_id ON user_quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_completions_reset_date ON user_quest_completions(reset_date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();