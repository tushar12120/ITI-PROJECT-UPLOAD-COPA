-- ============================================
-- ITI COPA Project Submission System
-- Supabase Database Schema
-- ============================================

-- Run this SQL in Supabase SQL Editor

-- 1. ADMIN TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Insert default admin (password-only login)
INSERT INTO admin (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;


-- 2. STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  trade VARCHAR(50) DEFAULT 'COPA',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, change deadline column type:
-- ALTER TABLE projects ALTER COLUMN deadline TYPE TIMESTAMP WITH TIME ZONE;

-- 4. SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  admin_comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, add columns:
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS admin_comment TEXT;


-- 5. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable these for security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo purposes
-- In production, make these more restrictive

CREATE POLICY "Allow all for admin" ON admin FOR ALL USING (true);
CREATE POLICY "Allow all for students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all for announcements" ON announcements FOR ALL USING (true);


-- ============================================
-- STORAGE BUCKETS
-- Create these manually in Supabase Dashboard:
-- 1. project-files (public)
-- 2. submissions (public)
-- ============================================
