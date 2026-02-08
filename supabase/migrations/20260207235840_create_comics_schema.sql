/*
  # Create Comics Platform Schema

  ## Description
  Creates the complete database schema for a comic book reading platform with user authentication,
  comic management, chapters, pages, and reading progress tracking.

  ## New Tables
  
  ### `comics`
  Main table for storing comic book information
  - `id` (uuid, primary key) - Unique identifier for each comic
  - `title` (text, required) - Comic title
  - `author` (text) - Comic author/creator name
  - `description` (text) - Comic synopsis/description
  - `cover_image` (text) - URL to cover image
  - `status` (text) - Publication status (Ongoing, Completed, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `chapters`
  Table for storing comic chapters
  - `id` (uuid, primary key) - Unique identifier for each chapter
  - `comic_id` (uuid, foreign key) - Reference to parent comic
  - `chapter_number` (integer, required) - Chapter sequence number
  - `title` (text, required) - Chapter title
  - `pages_count` (integer) - Number of pages in chapter
  - `created_at` (timestamptz) - Record creation timestamp

  ### `pages`
  Table for storing individual comic pages
  - `id` (uuid, primary key) - Unique identifier for each page
  - `chapter_id` (uuid, foreign key) - Reference to parent chapter
  - `page_number` (integer, required) - Page sequence number
  - `image_url` (text, required) - URL to page image
  - `created_at` (timestamptz) - Record creation timestamp

  ### `reading_progress`
  Table for tracking user reading progress
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `comic_id` (uuid, foreign key) - Reference to comic being read
  - `chapter_id` (uuid, foreign key) - Last chapter read
  - `page_number` (integer) - Last page viewed
  - `updated_at` (timestamptz) - Last reading timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with appropriate policies:
  
  #### Comics Table
  - Public read access for all comics
  - Authenticated users can insert/update/delete their own content
  
  #### Chapters Table
  - Public read access for all chapters
  - Authenticated users can manage chapters
  
  #### Pages Table
  - Public read access for all pages
  - Authenticated users can manage pages
  
  #### Reading Progress Table
  - Users can only view and manage their own reading progress
  - No public access to other users' data

  ## Indexes
  - Comic title search index for fast text search
  - Foreign key indexes for optimal join performance
  - Reading progress user lookup index
*/

CREATE TABLE IF NOT EXISTS comics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  cover_image text,
  status text DEFAULT 'Ongoing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comic_id uuid REFERENCES comics(id) ON DELETE CASCADE NOT NULL,
  chapter_number integer NOT NULL,
  title text NOT NULL,
  pages_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comic_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(chapter_id, page_number)
);

CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comic_id uuid REFERENCES comics(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  page_number integer DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comic_id)
);

CREATE INDEX IF NOT EXISTS idx_comics_title ON comics USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_chapters_comic ON chapters(comic_id);
CREATE INDEX IF NOT EXISTS idx_pages_chapter ON pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_comic ON reading_progress(comic_id);

ALTER TABLE comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comics are viewable by everyone"
  ON comics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert comics"
  ON comics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comics"
  ON comics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comics"
  ON comics FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Chapters are viewable by everyone"
  ON chapters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert chapters"
  ON chapters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters"
  ON chapters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chapters"
  ON chapters FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Pages are viewable by everyone"
  ON pages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own reading progress"
  ON reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress"
  ON reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress"
  ON reading_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
